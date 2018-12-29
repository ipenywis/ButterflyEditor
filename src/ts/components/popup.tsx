import { Editor, EditorState } from "draft-js";
import { EventEmitter } from "events";
import * as React from "react";
import * as ReactDOM from "react-dom";
//Click outside handler (Not Airbnb)
import ClickOutsideHandler from "../clickOutsideHandler";
//Icon
import Icon from "../components/toolBar/icon";
//Main App State
import { AppState } from "../store";
//Safe Wrapper
import { SafeWrapper } from "./common";
//Outside Click Handler from Lovelly Airbnb
//TODO: BAD BOY ==> import OutsideClickHandler from "react-outside-click-handler";
import createStyle, { ICreateStyle, IStyle } from "./toolBar/inlineStyle";

export interface PopupProps {
  label?: string;
  icon?: typeof Icon | Object;
  canOutsideClose?: boolean;
  isInline?: boolean;

  //React Portal (render popup on #bef-editor container)
  usePortal?: boolean;

  header?: string;
  container?: React.ReactElement<any>;
  footer?: React.ReactElement<any> | React.ReactElement<any>[];

  popupContainerStyle?: Partial<React.CSSProperties>;
  containerStyle?: Partial<React.CSSProperties>;
  //Outside Click Discared Elements from Closing Popup (Exceptions)
  outsideClkDiscaredElem?: string[];

  //Is Popup Disabled
  isDisabled?: boolean;

  /**(Popup) ComponentWillMount (Popup is going to open)*/
  onOpen?: () => void;
  /**(Popup) ComponentDidMount (Popup was opened) */
  onDidOpen?: () => void;

  onClose?: () => void;
  onCloseCross?: () => void;

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
  topPos: number;
  leftPos: number;
}

export default class Popup extends React.Component<PopupProps, PopupState> {
  state: PopupState;
  popup: HTMLDivElement;
  toggleBtn: HTMLDivElement;
  //Close Button
  closeBtn: HTMLSpanElement;

  eventEmitter: EventEmitter;

  //Default Props
  static defaultProps = {
    isInline: true,
    canOutsideClose: true,
    usePortal: true,
    header: "Test Popup",
    container: <div>Nothing is in the Popup</div>,
    footer: <div>Control Button Should Go Here</div>
  };

  constructor(props: PopupProps) {
    super(props);
    this.state = {
      isOpen: false,
      didOpen: false,
      topPos: null,
      leftPos: null
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

  openPopup() {
    if (!this.state.isOpen && this.props.onOpen) {
      //Run OnOpen for first time for initialization
      this.props.onOpen();
    }
    //Show Popup and Say that it did Open
    this.setState({ isOpen: true });
  }

  closePopup() {
    this.setState({ isOpen: false, didOpen: false });
    this.props.onClose ? this.props.onClose() : null;
  }

  componentDidMount() {
    //Calculate ToggleBtn window relative Top and Left Position for using it with the Popup if the Portal is Active.
    const toggleBtnBoundingBox = this.toggleBtn.getBoundingClientRect();
    //Offset the Top & Left position a littel bit
    this.setState({
      topPos: toggleBtnBoundingBox.top + toggleBtnBoundingBox.height + 14,
      leftPos: toggleBtnBoundingBox.left - 5
    });
  }

  componentDidUpdate() {
    //Updated and the Popup isOpen?
    if (this.state.isOpen && !this.state.didOpen && this.props.onDidOpen) {
      //Run Callback
      this.props.onDidOpen();
      //Set DidOpen
      this.setState({ didOpen: true });
    }
  }

  render() {
    const {
      isInline,
      icon,
      isDisabled,
      usePortal,
      header,
      container,
      footer,
      containerStyle,
      popupContainerStyle,
      canOutsideClose,
      onCloseCross,
      outsideClkDiscaredElem
    } = this.props;
    const { isOpen, topPos, leftPos } = this.state;
    //Check for Icon type
    if (!React.isValidElement(icon)) {
      console.error("Editor Popup Icon is Invalid");
    }

    //Calculate Popup Style (Only if its using Portal)
    const popupStyle: React.CSSProperties = usePortal
      ? { position: "fixed", width: "auto", top: topPos, left: leftPos }
      : null;

    //Popup Element
    const popupElment = (
      <div className={isInline ? "inline-popup" : "popup"} style={popupStyle}>
        <ClickOutsideHandler
          onOutsideClick={canOutsideClose && this.closePopup.bind(this)}
          discaredElmentsClassNames={outsideClkDiscaredElem}
          style={
            isInline
              ? { width: "100%", height: "100%", display: "flex" }
              : {
                  width: "auto",
                  height: "auto",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  position: "relative"
                }
          }
        >
          <div
            className="popup-container"
            ref={popup => (this.popup = popup)}
            style={popupContainerStyle}
          >
            <div className="header">{header}</div>
            <div className="container" style={containerStyle}>
              {container}
            </div>
            <div className="footer">{footer}</div>
          </div>
          <span
            className="popup-close"
            ref={closeBtn => (this.closeBtn = closeBtn)}
            onClick={onCloseCross ? onCloseCross : this.closePopup.bind(this)}
          >
            <Icon icon={"cross"} size={11} />
          </span>
        </ClickOutsideHandler>
        <div className="popup-tail-shadow" />
        <div className="popup-tail-glow" />
        <div className="popup-tail" />
      </div>
    );

    return (
      <SafeWrapper
        style={{
          position: "relative",
          borderRight: "1px solid rgba(187, 187, 187, 0.16)"
        }}
      >
        <div
          className={
            "t-item " + (isDisabled ? "disabled" : isOpen ? "toggle" : "")
          }
          onMouseDown={() => (!isDisabled ? this.togglePopup() : null)}
          ref={toggleBtn => (this.toggleBtn = toggleBtn)}
        >
          {icon && <div className="t-icon">{icon}</div>}
        </div>
        {!isDisabled &&
          isOpen &&
          usePortal &&
          ReactDOM.createPortal(
            popupElment,
            document.getElementById("bfe-portal")
          )}
        {!isDisabled && isOpen && !usePortal && popupElment}
      </SafeWrapper>
    );
  }
}
