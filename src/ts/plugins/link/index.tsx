import * as React from "react";

//Popup
import Popup from "../../components/popup";
import { Editor, EditorState } from "draft-js";

//AppState
import { AppState } from "../../store";

//EventEmitter
import { EventEmitter } from "events";

//Icon
import { Icon } from "react-icons-kit";
import { link } from "react-icons-kit/fa/";

//Blueprint
import {
  FormGroup,
  InputGroup,
  Intent,
  AnchorButton,
  Checkbox
} from "@blueprintjs/core";

//Link Style
import "./style.scss";

//Draftjs Entity
import { applyEntity } from "../../components/draft/entity";

//Rich Utils extended
import RichUtils from "../../components/toolBar/richUtils";

export interface LinkProps {
  editorState: EditorState;
  editor: Editor;
  updateEditorState: (newEditorState: EditorState) => void;

  //is Link Disabled
  isDisabled?: boolean;

  //Events
  on?: (
    eventName: string,
    handler: (appState?: AppState, ...args: any[]) => void
  ) => EventEmitter;
  emit?: (eventName: string, ...args: any[]) => boolean;
}

interface LinkState {
  url: string;
  error: string;
  openNewTab: boolean;
}

export class Link extends React.Component<LinkProps, LinkState> {
  popup: Popup;
  linkInput: HTMLInputElement;

  //Entity Type
  static LINK_TYPE = "LINK";

  constructor(props: LinkProps) {
    super(props);
    this.state = {
      url: null,
      error: null,
      openNewTab: false
    };
  }

  onURLChange(e: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ url: e.target.value });
  }

  setError(err: string) {
    this.setState({ error: err });
  }

  clearErrors() {
    this.setState({ error: null });
  }

  onLinkSubmit() {
    //Validate Link
    const { url, openNewTab } = this.state;
    //let linkRegex = /(https?:?\/?\/?)?(\w+\.+\w+)/;
    let linkRegex = /(https?:\/\/)?([\w.-]+(?:\.[\w\.-]+)+[\w\-\.%_~:/?#[\]@!\$&'\(\)\*\+,;=.]+)/;
    let finalURL = "";
    if (!url) {
      this.setError("Please Enter a Valid URL");
      return;
    } else if (linkRegex.test(url)) {
      let parsedLink = linkRegex.exec(url);
      if (parsedLink[2]) {
        //Check Http Protocol
        if (!parsedLink[1]) finalURL = "http://" + parsedLink[2];
        else finalURL = parsedLink[0];
        //Success Add Link Entity to Draft Editor
        const newEditorState = applyEntity(
          this.props.editorState,
          "LINK",
          "MUTABLE",
          { url: finalURL, target: openNewTab ? "_blank" : null }
        );
        this.props.updateEditorState(newEditorState);
        //Clear Errors if there is any!
        this.clearErrors();
        //Hide Link Popup
        this.popup.closePopup();
      } else {
        this.setError("Invalid Link!");
        return;
      }
    } else {
      this.setError("Invalid Link!");
      return;
    }
  }

  onUnlinkSubmit() {
    //Remove link from selection
    const { editorState } = this.props;
    const selection = editorState.getSelection();
    //Remove link by toggeling selection with a null Entity
    if (!selection.isCollapsed())
      //Make sure there is something selected
      this.props.updateEditorState(
        RichUtils.toggleLink(editorState, selection, null)
      );
    //Close Popup
    this.popup.closePopup();
  }

  getCurrentTextLink(): string {
    const { editorState } = this.props;
    //Cursor start & offset keys
    const startKey = editorState.getSelection().getStartKey();
    const startOffset = editorState.getSelection().getStartOffset();
    //Get Link Text Block
    const blockWithLinkAtBeginning = editorState
      .getCurrentContent()
      .getBlockForKey(startKey);
    //Get Entity Key at position
    const linkKey = blockWithLinkAtBeginning.getEntityAt(startOffset);
    if (linkKey) {
      //Get Link Entity With Entity's Key
      const linkInstance = editorState.getCurrentContent().getEntity(linkKey);
      //Make sure it's a Link Entity
      if (linkInstance.getType() != Link.LINK_TYPE) return null;
      //Grab & Return Link URL
      if (linkInstance.getData()) return linkInstance.getData().url;
    }
    //No Link is Selected
    return null;
  }

  handleKeyPress(e: React.KeyboardEvent) {
    if (e.key == "Enter") this.onLinkSubmit();
  }

  onPopupOpen() {
    //Auto focus on Link Input (timeout to 0 to make sure it focuses)
    setTimeout(() => this.linkInput.focus(), 0);
  }

  handleOpenNewTabChange(e: React.MouseEvent<HTMLInputElement>) {
    this.setState({ openNewTab: e.currentTarget.checked });
  }

  render() {
    const {
      isDisabled,
      editorState,
      updateEditorState,
      editor,
      on,
      emit
    } = this.props;
    const { error } = this.state;

    let current = "link";
    //Check if Current Selected Text (Cursor) is a link (to activate Edit and Remove mode)
    let linkURL = this.getCurrentTextLink();
    if (linkURL) {
      //Change Mode to Unlink which also includes the Edit Mode
      current = "unlink";
    }

    //Popup is Inline (More like Popover)
    const isPopupInline = true;

    //Button Icon
    const icon = <Icon icon={link} />;
    console.warn("State: ", this.state);
    //Header
    const header = current == "link" ? "Set Link" : "Manage Link";
    //Container
    const container = (
      <div className="inner-container">
        <FormGroup
          helperText={error ? error : "Make Sure the Link is Valid"}
          label="Link URL"
          labelFor="link-input"
          labelInfo="required"
          intent={error ? Intent.DANGER : Intent.PRIMARY}
        >
          <InputGroup
            id="link-input"
            placeholder="URL"
            intent={error ? Intent.DANGER : Intent.PRIMARY}
            onChange={this.onURLChange.bind(this)}
            defaultValue={linkURL ? linkURL : ""}
            onKeyPress={this.handleKeyPress.bind(this)}
            inputRef={input => (this.linkInput = input)}
          />
        </FormGroup>
        <Checkbox
          checked={this.state.openNewTab}
          onChange={this.handleOpenNewTabChange.bind(this)}
          label="Open in New Tab"
        />
      </div>
    );

    //Footer
    const footer = (
      <div className="footer-container">
        <AnchorButton
          text={current}
          minimal={true}
          intent={Intent.PRIMARY}
          onClick={
            current == "link"
              ? this.onLinkSubmit.bind(this)
              : this.onUnlinkSubmit.bind(this)
          }
        />
        {linkURL && (
          <AnchorButton
            type="submit"
            text="update"
            minimal={true}
            intent={Intent.WARNING}
            onClick={this.onLinkSubmit.bind(this)}
          />
        )}
      </div>
    );

    return (
      <Popup
        icon={icon}
        isDisabled={isDisabled}
        editorState={editorState}
        updateEditorState={updateEditorState}
        editor={editor}
        on={on}
        emit={emit}
        header={header}
        container={container}
        footer={footer}
        didOpen={this.onPopupOpen.bind(this)}
        onClose={this.clearErrors.bind(this)}
        ref={popup => (this.popup = popup)}
      />
    );
  }
}
