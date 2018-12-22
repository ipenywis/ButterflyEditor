import * as React from "react";

//Plugin
import Plugin from "../plugin";

//Icon
import Icon from "../../components/toolBar/icon";

//Popup
import Popup from "../../components/popup";
//Common
import { SafeWrapper } from "../../components/common";

//Style
import "./style.scss";

//Main App State
import { AppState } from "../../store";

//Build Components
import Slider from "rc-slider"; ///< TODO: Make your own custom slider component
import "rc-slider/assets/index.css";

//Color
import * as Color from "color";
import { EditorState, Editor } from "draft-js";
import { ICreateStyle } from "../../components/toolBar/inlineStyle";
import { EventEmitter } from "events";

interface ColorPickerProps {
  editorState: EditorState;
  updateEditorState: (newEditorState: EditorState) => void;
  editor: Editor;

  //is ColorPicker Disabled
  isDisabled?: boolean;

  //Events
  on?: (
    eventName: string,
    handler: (appState?: AppState, ...args: any[]) => void
  ) => EventEmitter;
  emit?: (eventName: string, ...args: any[]) => boolean;
}

interface ColorPickerState {
  opacityValue: number;
  pickedColor: RGBAColor;
  colorText: boolean;
  colorBackground: boolean;
}

export class ColorPicker extends Plugin<ColorPickerProps, ColorPickerState> {
  state: ColorPickerState;
  //Picker
  private picker: Picker;

  //Opacity Slider
  opacitySlider: Slider;

  //Canvas
  canvas: HTMLCanvasElement;
  //Timeouts
  private colorChangeTOUT: number;
  //Popup
  popup: Popup;
  container: HTMLDivElement;

  //Loop Interval
  interval: number | NodeJS.Timer;
  colorInput: HTMLInputElement;

  previewContainer: HTMLDivElement;

  input: any;

  constructor(props: ColorPickerProps) {
    super(props);
    this.state = {
      opacityValue: 1,
      pickedColor: { r: 0, g: 0, b: 0, a: 0 },
      colorText: true,
      colorBackground: false
    };
  }

  init() {
    //this.popup.focus();
    /*Full Color Picker Initialization*/
    //Init Picker
    this.picker = new Picker(this.canvas, 220, 180); ///< Hard CODED WIDTH & HEIGHT VALUES
    //Initial Color
    this.setState({ pickedColor: this.picker.getPickedColor() });
    //Clear Privious Interval to prevent processes Leaks
    window.clearInterval(this.interval as number);
    //Run & Loop on the PICKER Draw
    this.interval = window.setInterval(() => this.picker.draw(), 1);
    //When Picked Color Changes
    this.picker.onChange(color => {
      this.setState({ pickedColor: color });
      const hexColor = Color({
        r: color.r,
        g: color.g,
        b: color.b
      }).hex();
      //Set Input Value
      this.colorInput.value = hexColor;

      //Init Picker Color
      this.setState({ pickedColor: this.picker.getPickedColor() });

      //Preview (RGBA)
      this.previewContainer.style.backgroundColor = `rgba(${color.r}, ${
        color.g
      }, ${color.b}, ${this.state.opacityValue})`;
    });

    /*Start Up Color*/
    let useInitialColor = false;
    let initialColor: RGBAColor = this.picker.getPickedColor();
    if (!this.props.editorState.getSelection().isCollapsed()) {
      //Color REGEX Pattern
      console.log(
        "Inline Sty7le: ",
        this.props.editorState.getCurrentInlineStyle()
      );
      let colorStyleRgx = /CUSTOM_COLOR_rgba?\((\d+)\s?,\s?(\d+)\s?,\s?(\d+)\s?,\s?(\d+)\s?\)/;
      let useInitialColor = false;
      this.props.editorState.getCurrentInlineStyle().map((val, key) => {
        if (colorStyleRgx.test(val) || colorStyleRgx.test(key)) {
          //Tell to use the current selected element's color instead of Default (BLACK COLOR)
          useInitialColor = true;
          //Get RGBA color from Captured Regex Groups
          initialColor = {
            r: parseInt(
              colorStyleRgx.exec(val)[1] || colorStyleRgx.exec(key)[1]
            ),
            g: parseInt(
              colorStyleRgx.exec(val)[2] || colorStyleRgx.exec(key)[2]
            ),
            b: parseInt(
              colorStyleRgx.exec(val)[3] || colorStyleRgx.exec(key)[3]
            ),
            a: parseInt(
              colorStyleRgx.exec(val)[4] || colorStyleRgx.exec(key)[4]
            )
          };
          console.log("Current COLOR: ", initialColor);
          this.picker.setColor(initialColor);
        }
      });
    }

    //Preview (RGBA)
    console.log("CURRENT: ", initialColor);
    this.previewContainer.style.backgroundColor = `rgba(${initialColor.r}, ${
      initialColor.g
    }, ${initialColor.b}, ${this.state.opacityValue})`;
  }

  onOpacitySliderChange(value: number) {
    //Change State opacity, picked color and the preview container
    const { pickedColor } = this.state;
    this.setState({
      opacityValue: value,
      pickedColor: { ...pickedColor, a: value }
    });
    this.previewContainer.style.backgroundColor = `rgba(${pickedColor.r}, ${
      pickedColor.g
    }, ${pickedColor.b}, ${value})`;
  }

  applyPickedColor() {
    //Get currently picked color
    const color = this.picker.getPickedColor();
    const { colorText, colorBackground, opacityValue } = this.state;

    //Make style ready
    let style: ICreateStyle["styles"] = null;
    if (colorBackground)
      style = {
        background: `rgba(${color.r}, ${color.g}, ${color.b}, ${opacityValue})`
      };
    else if (color)
      style = {
        color: `rgba(${color.r}, ${color.g}, ${color.b}, ${opacityValue})`
      };

    this.popup.toggleStyle(style);
    //Close popup
    this.popup.closePopup();
  }

  onCurrentColorChange(e: React.MouseEvent) {
    //Presist event for using after timeout
    e.persist();
    //Wait until the users stops typing by delaying it (Timeout)
    //Clear Cached Timeout First
    window.clearTimeout(this.colorChangeTOUT);
    //Validate
    let hexRgx = /^#(?:[0-9a-fA-F]{3}){1,2}$/;
    const hexVal = (e.target as HTMLInputElement).value;
    if (!hexRgx.test(hexVal)) {
      return;
    }
    //Update Picker Color
    let color = Color(hexVal, "hex").rgb();
    this.picker.setColor({
      r: color.red(),
      g: color.green(),
      b: color.blue(),
      a: 1
    });
  }

  render() {
    const { isDisabled } = this.props;

    let header = "Color Picker";

    let hexColor = Color({
      r: this.state.pickedColor.r,
      g: this.state.pickedColor.g,
      b: this.state.pickedColor.b
    }).hex();

    let container = (
      <div
        onMouseDown={e => this.props.editor.blur()}
        ref={container => (this.container = container)}
      >
        <div className="color-picker-container">
          <canvas id="color-picker" ref={canvas => (this.canvas = canvas)} />
          <div className="info">
            <div className="item opacity-control">
              <div className="title">Opacity: </div>
              <Slider
                min={0}
                max={1}
                step={0.1}
                value={this.state.opacityValue}
                onChange={this.onOpacitySliderChange.bind(this)}
                ref={slider => (this.opacitySlider = slider)}
              />
            </div>
            <div className="item current-color">
              <div className="title">Current: </div>
              <input
                type="text"
                onChange={this.onCurrentColorChange.bind(this)}
                defaultValue="#fff"
                ref={input => (this.colorInput = input)}
              />
            </div>
            <div
              className="item preview"
              ref={preview => (this.previewContainer = preview)}
            />
          </div>
        </div>
      </div>
    );
    //Popup Footer
    let footer = (
      <SafeWrapper style={{ flexDirection: "row-reverse" }}>
        <button
          className="popup-btn success"
          onClick={this.applyPickedColor.bind(this)}
        >
          Choose
        </button>
        <button
          className="popup-btn danger"
          onClick={() => this.popup.closePopup()}
        >
          Close
        </button>
      </SafeWrapper>
    );

    const icon = <Icon icon={"colorPicker"} />;

    return (
      <Popup
        header={header}
        container={container}
        footer={footer}
        isInline={false}
        isDisabled={isDisabled}
        usePortal={false}
        icon={icon}
        didOpen={this.init.bind(this)}
        ref={popup => (this.popup = popup)}
        editorState={this.props.editorState}
        updateEditorState={this.props.updateEditorState}
        editor={this.props.editor}
        on={this.props.on}
        emit={this.props.emit}
        popupContainerStyle={{ width: "auto", height: "auto" }}
      />
    );
  }
}

interface PickerElement {
  x: number;
  y: number;
  width: number;
  height: number;
}
//Color
interface RGBAColor {
  r: number;
  g: number;
  b: number;
  a?: number;
}

//Picker
class Picker {
  private target: HTMLCanvasElement;
  private width: number;
  private height: number;
  private context: CanvasRenderingContext2D;
  //Picker Circle
  private pickerCirlce: PickerElement;
  //Picker Circle Color
  private pickerCircleColor: RGBAColor;

  /*Callbacks*/
  private onChangeCallback: (color: RGBAColor) => void;

  constructor(target: HTMLCanvasElement, width: number, height: number) {
    //Rendering Context
    this.target = target;
    this.context = target.getContext("2d");
    this.width = this.target.width = width;
    this.height = this.target.height = height;
    //Picker Cirlce (Start Point)
    this.pickerCirlce = { x: 10, y: this.height - 3, width: 8, height: 8 };
    //It's color start with White since it's in the black area
    this.pickerCircleColor = { r: 255, g: 255, b: 255 };
    //Listen For Picker Events
    this.listenForEvents();
  }

  draw() {
    //Map Alpha property to the class of nothing and
    //Build the Canvas
    this.build();
    this.pickerCirlce;
    this.target.parentElement.offsetLeft;
  }

  mapAlpha(v: number): number {
    return Math.round(v / 2.55) / 100;
  }

  setColor(color: RGBAColor) {
    //Get Color For the Whole Canvas and loop through pixels WIDTH & HEIGHT
    let found = false;
    for (let y = 0; y < this.width; y++) {
      for (let x = 0; x < this.height; x++) {
        //Get Color Data for the Current Pixel
        const colorData = this.context.getImageData(x, y, 1, 1);
        let rangeColor = { r: color.r, g: color.g, b: color.b };
        if (
          colorData.data[0] == rangeColor.r &&
          colorData.data[1] == rangeColor.g &&
          colorData.data[2] == rangeColor.b
        ) {
          console.log(colorData);
          //Change Circle Picker Position to the Set Color Position
          this.pickerCirlce.x = x;
          this.pickerCirlce.y = y;
          break;
        }
      }
      //Found then get out of the Loop
      if (found) break;
    }
  }

  getPickedColor(inverse?: boolean): RGBAColor {
    //Get Pixels
    let colorData = this.context.getImageData(
      this.pickerCirlce.x,
      this.pickerCirlce.y,
      1,
      1
    );
    //Return Inversed RGB
    if (inverse)
      return {
        r: Math.abs(colorData.data[0] - 255),
        g: Math.abs(colorData.data[1] - 255),
        b: Math.abs(colorData.data[3] - 255),
        a: this.mapAlpha(colorData.data[3])
      };

    //Return RGB
    return {
      r: colorData.data[0],
      g: colorData.data[1],
      b: colorData.data[2],
      a: this.mapAlpha(colorData.data[3])
    } as RGBAColor;
  }

  private build() {
    //Build Gradient Colors on the 2D Canvas
    let gradient = this.context.createLinearGradient(0, 0, this.width, 0);
    //Color Stops
    gradient.addColorStop(0, "rgb(255, 0, 0)");
    gradient.addColorStop(0.15, "rgb(255, 0, 255)");
    gradient.addColorStop(0.33, "rgb(0, 0, 255)");
    gradient.addColorStop(0.49, "rgb(0, 255, 255)");
    gradient.addColorStop(0.67, "rgb(0, 255, 0)");
    gradient.addColorStop(0.84, "rgb(255, 255, 0)");
    gradient.addColorStop(1, "rgb(255, 0, 0)");
    //Fill it
    this.context.fillStyle = gradient;
    this.context.fillRect(0, 0, this.width, this.height);

    //Add White Color
    gradient = this.context.createLinearGradient(0, 0, 0, this.height);
    gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
    gradient.addColorStop(0.03, "rgba(255, 2555, 255, 1)");
    gradient.addColorStop(0.5, "rgba(255, 255, 255, 0)");
    gradient.addColorStop(0.5, "rgba(0, 0, 0, 0)");
    gradient.addColorStop(0.97, "rgba(0, 0, 0, 1)");
    gradient.addColorStop(1, "rgba(0, 0, 0, 1)");
    this.context.fillStyle = gradient;
    this.context.fillRect(0, 0, this.width, this.height);

    //Circle Color Selector
    this.context.beginPath();
    this.context.arc(
      this.pickerCirlce.x,
      this.pickerCirlce.y,
      this.pickerCirlce.width,
      0,
      Math.PI * 2
    );
    this.context.strokeStyle = `rgb(${this.pickerCircleColor.r}, ${
      this.pickerCircleColor.g
    }, ${this.pickerCircleColor.b})`;
    this.context.stroke();
    this.context.closePath();
  }

  checkCurrentElm(elm: PickerElement, x: number, y: number) {
    if (
      y > elm.y - elm.width &&
      y < elm.y + elm.width &&
      x > elm.x - elm.width &&
      x < elm.x + elm.width
    ) {
      return true;
    }
    return false;
  }

  //On Value Change Event
  onChange(callback: (color: RGBAColor) => void) {
    this.onChangeCallback = callback;
  }

  triggerOnChange() {
    this.onChangeCallback(this.getPickedColor());
  }

  private listenForEvents() {
    let isMouseDown = false;
    //NOTE: getBoundingClientRect is used to get window's relative target element's offsets
    const onMouseDown = (e: MouseEvent) => {
      if (
        this.checkCurrentElm(
          this.pickerCirlce,
          e.clientX - this.target.getBoundingClientRect().left,
          e.clientY - this.target.getBoundingClientRect().top
        )
      ) {
        isMouseDown = true;
      } else {
        //Not on Circle Picker but on the Color Picker canvas then choose the clicked spot
        this.pickerCirlce.x =
          e.clientX - this.target.getBoundingClientRect().left;
        this.pickerCirlce.y =
          e.clientY - this.target.getBoundingClientRect().top;
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      if (isMouseDown) {
        this.pickerCirlce.x =
          e.clientX - this.target.getBoundingClientRect().left;
        this.pickerCirlce.y =
          e.clientY - this.target.getBoundingClientRect().top;
      }
    };

    const onMouseUp = (e: MouseEvent) => {
      isMouseDown = false;
    };

    //Register Events
    this.target.addEventListener("mousedown", onMouseDown);
    this.target.addEventListener("mousemove", onMouseMove);
    //On change event on Both Mouse Move and Mouse Down Events
    this.target.addEventListener("mousemove", () => {
      this.onChangeCallback(this.getPickedColor());
      //Change picker circle color depending on the current color to prevent color overlapping and bliding
      this.pickerCircleColor = this.getPickedColor(true);
    });
    this.target.addEventListener("mousedown", () => {
      this.onChangeCallback(this.getPickedColor());
      //Change picker circle color depending on the current color to prevent color overlapping and bliding
      this.pickerCircleColor = this.getPickedColor(true);
    });
    //Up Event is on the Document
    document.addEventListener("mouseup", onMouseUp);
  }
}
