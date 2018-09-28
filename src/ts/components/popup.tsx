import * as React from "react";

//Icon
import { Icon } from "react-icons-kit";

//Safe Wrapper
import { SafeWrapper } from "./common";

//Outside Click Handler from Lovelly Airbnb
//TODO: BAD BOY ==> import OutsideClickHandler from "react-outside-click-handler";

import createStyle, { IStyle, ICreateStyle } from "./toolBar/inlineStyle";
import { EditorState, Editor, RichUtils, Modifier } from "draft-js";
import { Popover } from "@blueprintjs/core";

//Main App State
import { AppState } from "../store";
import { EventEmitter } from "events";

//Lodash
import * as _ from "lodash";

//Click outside handler (Not Airbnb)
import ClickOutsideHandler from "../clickOutsideHandler";

export interface PopupProps {
  label?: string;
  icon?: typeof Icon | Object;

  isInline?: boolean;

  header?: string;
  container?: React.ReactElement<any>;
  footer?: React.ReactElement<any> | React.ReactElement<any>[];

  onOpen?: () => void;
  didOpen?: () => void;

  onClose?: () => void;

  editorState: EditorState;
  updateEditorState: (newEditorState: EditorState) => void;
  editor: Editor;

  //Events
  on?: (
    eventName: string,
    handler: (appState?: AppState, ...args: any[]) => void
  ) => EventEmitter;
  emit?: (eventName: string, ...args: any[]) => boolean;
}

interface PopupState {
  isOpen: boolean;
  didOpen: boolean;
}

export default class Popup extends React.Component<PopupProps, PopupState> {
  state: PopupState;
  popup: HTMLDivElement;
  toggleBtn: HTMLDivElement;

  eventEmitter: EventEmitter;

  //Default Props
  static defaultProps = {
    isInline: true,
    header: "Test Popup",
    container: <div>Nothing is in the Popup</div>,
    footer: <div>Control Button Should Go Here</div>
  };

  constructor(props: PopupProps) {
    super(props);
    this.state = {
      isOpen: false,
      didOpen: false
    };
  }

  togglePopup(e?: React.MouseEvent) {
    if (!this.state.isOpen && this.props.onOpen) {
      this.props.onOpen();
    }
    //Didn't Open yet on close
    if (this.state.isOpen) {
      this.setState({ didOpen: false });
      //Run on Close Callback if any!
      this.props.onClose ? this.props.onClose() : null;
    }
    //Toggle it's Open State
    this.setState(prevState => ({ isOpen: !prevState.isOpen }));
  }

  //Apply Custom Style
  toggleStyle(styles: ICreateStyle["styles"]) {
    const { editorState } = this.props;
    //Focus Editor
    //Force it to Original Selection

    let newEditorState: EditorState = editorState;
    if (editorState.getSelection().isCollapsed()) {
      this.props.editor.focus();
      newEditorState = EditorState.forceSelection(
        editorState,
        editorState.getSelection()
      );
      newEditorState = EditorState.moveFocusToEnd(newEditorState);
    }
    newEditorState = Object.keys(styles).reduce((prevEditorState, style) => {
      return (createStyle.styles[style] as IStyle).toggle(
        prevEditorState,
        styles[style] as string
      );
    }, newEditorState);

    this.props.updateEditorState(newEditorState);
  }

  onEditorBlur() {
    //If the button is valid and we are on the popup container then click it again to get back and focus on the popup
    //this.toggleBtn.click();
  }

  componentDidMount() {
    //Once Blured Show the Popup
    /*this.eventEmitter = this.props.on(
      "EditorBlur",
      this.onEditorBlur.bind(this)
    );*/
  }

  closePopup() {
    this.setState({ isOpen: false, didOpen: false });
    this.props.onClose ? this.props.onClose() : null;
  }

  componentDidUpdate() {
    //Updated and the Popup isOpen?
    if (this.state.isOpen && !this.state.didOpen && this.props.didOpen) {
      this.props.didOpen();
      this.setState({ didOpen: true });
    }
  }

  render() {
    const { isInline, icon, label, header, container, footer } = this.props;
    const { isOpen } = this.state;
    //Check for Icon type
    if (!React.isValidElement(icon)) {
      console.error("Popup Icon is Invalid");
    }
    return (
      <SafeWrapper
        style={{
          position: "relative",
          borderRight: "1px solid rgba(187, 187, 187, 0.16)"
        }}
      >
        <div
          className={"t-item " + (isOpen ? "toggle" : "")}
          onMouseDown={() => this.setState({ isOpen: true })}
          //onClick={this.togglePopup.bind(this)}
        >
          {icon && <div className="t-icon">{icon}</div>}
        </div>
        {isOpen && (
          <div className={isInline ? "inline-popup" : "popup"}>
            <ClickOutsideHandler
              onOutsideClick={this.closePopup.bind(this)}
              style={
                isInline
                  ? { width: "100%", height: "100%", display: "flex" }
                  : {}
              }
            >
              <div
                className="popup-container"
                ref={popup => (this.popup = popup)}
              >
                <div className="header">{header}</div>
                <div className="container">{container}</div>
                <div className="footer">{footer}</div>
              </div>
            </ClickOutsideHandler>
            <div className="popup-tail-shadow" />
            <div className="popup-tail-glow" />
            <div className="popup-tail" />
          </div>
        )}
      </SafeWrapper>
    );
  }
}
