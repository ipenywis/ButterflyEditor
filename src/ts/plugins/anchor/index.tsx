import * as React from "react";

import Popup from "../../components/popup";

//Style
import "./style.scss";

import { Editor, EditorState, Modifier } from "draft-js";

//Apply Entity Draftjs
import { applyEntity } from "../../components/draft/entity";

//App State
import { AppState } from "../../store";

//Events
import { EventEmitter } from "events";

//Icon
import { Icon } from "react-icons-kit";
import { flag } from "react-icons-kit/fa/";

//Blueprintjs
import { FormGroup, InputGroup, AnchorButton, Intent } from "@blueprintjs/core";

interface AnchorProps {
  editorState: EditorState;
  editor: Editor;
  updateEditorState: (newEditorState: EditorState) => void;

  //is anchor disabled
  isDisabled?: boolean;

  //Events
  on?: (
    eventName: string,
    handler: (appState?: AppState, ...args: any[]) => void
  ) => EventEmitter;
  emit?: (eventName: string, ...args: any[]) => boolean;
}

interface AnchorState {
  anchor: string;
  error: string;
}

export default class Anchor extends React.Component<AnchorProps, AnchorState> {
  state: AnchorState; ///< Comp State
  popup: Popup;
  anchorInput: HTMLInputElement;
  //Entity Type
  static ENTITY_TYPE = "ANCHOR";

  constructor(props: AnchorProps) {
    super(props);
    this.state = {
      anchor: null,
      error: null
    };
  }

  onAnchorChange(e: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ anchor: e.target.value });
  }

  setError(err: string) {
    this.setState({ error: err });
  }

  clearErrors() {
    this.setState({ error: null });
  }

  onAnchorSubmit() {
    //Validate Anchor Input
    const { editorState, updateEditorState } = this.props;
    const { anchor } = this.state;
    if (!anchor) {
      this.setError("Please Specify Anchor Name");
      return;
    }
    //Remove Trilling and Ending Spaces + replace white space with: -
    let finalAnchor = anchor.replace(" ", "-").trim();
    //Submit Anchor
    const newEditorState = applyEntity(
      editorState,
      Anchor.ENTITY_TYPE,
      "MUTABLE",
      {
        anchor: finalAnchor
      }
    );
    //Update Editor State
    updateEditorState(newEditorState);
    //Hide Link Popup
    this.popup.closePopup();
  }

  onUnanchorSubmit() {
    //Remove Anchor from selection
    const { editorState, updateEditorState } = this.props;
    const selection = editorState.getSelection();
    //Remove link by toggeling selection with a null Entity
    if (!selection.isCollapsed()) {
      //Make sure there is something selected
      const newEditorState = EditorState.set(editorState, {
        currentContent: Modifier.applyEntity(
          editorState.getCurrentContent(),
          editorState.getSelection(),
          null
        )
      });
      //Update Editor State
      updateEditorState(newEditorState);
    }
    //Close Popup
    this.popup.closePopup();
  }

  getCurrentTextAnchor(): string {
    const { editorState } = this.props;
    //Cursor start & offset keys
    const startKey = editorState.getSelection().getStartKey();
    const startOffset = editorState.getSelection().getStartOffset();
    //Get Link Text Block
    const blockWithAnchorAtTheBeginning = editorState
      .getCurrentContent()
      .getBlockForKey(startKey);
    //Get Entity Key at position
    const anchorKey = blockWithAnchorAtTheBeginning.getEntityAt(startOffset);
    if (anchorKey) {
      //Get Link Entity With Entity's Key
      const anchorInstance = editorState
        .getCurrentContent()
        .getEntity(anchorKey);
      //Make sure it's an Anchor and not other entity type
      if (anchorInstance.getType() != Anchor.ENTITY_TYPE) return null;
      //Grab & Return Link URL
      if (anchorInstance.getData()) return anchorInstance.getData().anchor;
    }
    //No Link is Selected
    return null;
  }

  handleKeyPress(e: React.KeyboardEvent) {
    if (e.key == "Enter") this.onAnchorSubmit();
  }

  onPopupOpen() {
    //Auto focus on Anchor Input (timeout to 0 to make sure it focuses)
    setTimeout(() => this.anchorInput.focus(), 0);
  }

  render() {
    const {
      on,
      emit,
      editorState,
      editor,
      updateEditorState,
      isDisabled
    } = this.props;
    const { error } = this.state;

    let current = "anchor";
    const anchorName = this.getCurrentTextAnchor();
    console.log("ANCHOR: ", anchorName);
    if (anchorName) {
      //Change current mode to unAnchor (Remove Anchor)
      current = "unanchor";
    }

    //Icon
    const icon = <Icon icon={flag} />;

    //Header
    const header = current == "anchor" ? "Set Anchor" : "Edit Anchor";
    //Container
    const container = (
      <div className="inner-container">
        <FormGroup
          helperText={error ? error : "Choose a valid name for Anchors"}
          label="Set an Anchor"
          labelFor="anchor-input"
          labelInfo="required"
          intent={error ? Intent.DANGER : Intent.PRIMARY}
        >
          <InputGroup
            id="anchor-input"
            placeholder="Name"
            intent={error ? Intent.DANGER : Intent.PRIMARY}
            inputRef={input => (this.anchorInput = input)}
            defaultValue={anchorName}
            onChange={this.onAnchorChange.bind(this)}
            onKeyPress={this.handleKeyPress.bind(this)}
          />
        </FormGroup>
      </div>
    );
    //Footer
    const footer = (
      <div className="footer-container">
        <AnchorButton
          text={current == "anchor" ? "set" : "remove"}
          minimal={true}
          intent={Intent.PRIMARY}
          onClick={
            current == "anchor"
              ? this.onAnchorSubmit.bind(this)
              : this.onUnanchorSubmit.bind(this)
          }
        />
        {anchorName && (
          <AnchorButton
            type="submit"
            text="update"
            minimal={true}
            intent={Intent.WARNING}
            onClick={this.onAnchorSubmit.bind(this)}
          />
        )}
      </div>
    );

    //Popup
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
