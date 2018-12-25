import * as React from "react";
import * as CodeMirror from "react-codemirror";
//CodeMirror Style
import "codemirror/lib/codemirror.css";
//CodeMirror Dracula Theme
import "codemirror/theme/dracula.css";
import Icon from "../../components/toolBar/icon";
import { SafeWrapper } from "../../components/common";
import Popover from "../components/popover";
import Button from "../components/button";
import { Intent } from "../components/intent";
import Popup from "../../components/popup";
import { EditorState, Editor } from "draft-js";
import { AppState } from "../../store";
import { EventEmitter } from "events";
import styled from "styled-components";
import Decorators from "../../components/draft/decorators";

import "./codeMirrorStyle.scss";
import {
  applyAtomicEntity,
  mergeEntityData
} from "../../components/draft/entity";
import { addEntityImportRule } from "../../components/draft/importOptions";

/**CodeMirror language Modes */
require("codemirror/mode/javascript/javascript.js");

const CodeMirrorStyled = styled(CodeMirror)`
  width: 100%;
`;

const SafeWrapperStyled = styled(SafeWrapper)`
  max-width: 60em;
  min-width: 50em;
`;

interface CodeMirrorEditorProps {
  editorState: EditorState;
  editor: Editor;
  updateEditorState: (newEditorState: EditorState) => void;

  //is CodeEditor Disabled
  isDisabled?: boolean;
  //Focus editor when it's mounted
  autoFocus?: boolean;

  //Events
  on?: (
    eventName: string,
    handler: (appState?: AppState, ...args: any[]) => void
  ) => EventEmitter;
  emit?: (eventName: string, ...args: any[]) => boolean;
}

interface CodeMirrorEditorState {
  code: string;
  isWarningPopupOpen: boolean;
  isEditMode: boolean;
  codeEditorEntityKey: string;
  currentLanguage: string;
}

export default class CodeMirrorEditor extends React.Component<
  CodeMirrorEditorProps,
  CodeMirrorEditorState
> {
  public state: CodeMirrorEditorState;
  popup: Popup;
  private codeEditorRef: React.Component<any>;
  private codeEditorInstance: CodeMirror.Editor;

  static defaultProps = {
    autoFocus: true
  };

  constructor(props: CodeMirrorEditorProps) {
    super(props);
    this.state = {
      code: null,
      isWarningPopupOpen: false,
      isEditMode: false,
      codeEditorEntityKey: null,
      currentLanguage: "javascript"
    };
  }

  popupDidOpen() {
    this.codeEditorInstance = (this.codeEditorRef as any).getCodeMirror();
    this.codeEditorInstance.on("change", () => {
      console.log("Code changed");
    });
  }

  componentWillMount() {
    //Listen For Code Editing Event from a Code Snippet Decorator
    this.props.on("EditCode", (appState, data) => {
      console.log("Edit Code requested... ", this.popup);
      //Open Popup WITH CODE (Event is being emitted from the Decorator)
      this.OpenWithCode(data[0], data[1]);
    });

    console.log("Popup: ", this.popup);

    //Add Code Snippet Import Rule (for importing (<pre> <code>) from HTML)
    addEntityImportRule(
      "CODE_SNIPPET",
      element => {
        return element.tagName === "PRE" || element.tagName === "CODE";
      },
      element => {
        if (element.tagName === "CODE") {
          let codeTextArr = [...element.children].map(child => {
            if (child) return child.textContent;
          });
          //Return Concatenated String
          return {
            code: codeTextArr.join(""),
            language: "javascript", ///< NOTE: Temporary, only for testing purposes
            isImportedCode: true
          };
        }
        return null;
      }
    );
  }

  componentWillUnmount() {
    console.log("Code editor is unmouting...");
  }

  render() {
    const {
      editor,
      editorState,
      updateEditorState,
      isDisabled,
      autoFocus
    } = this.props;
    const { code, isWarningPopupOpen } = this.state;

    const icon = <Icon icon={"codeEditor"} />;

    const header = "Code Mirror Editor";

    const editorOptions: CodeMirror.EditorConfiguration = {
      mode: "javascript",
      theme: "dracula"
    };

    const isCodeValid = code && code.trim() !== "";

    const container = (
      <SafeWrapperStyled>
        <CodeMirrorStyled
          value={code}
          onChange={this.updateCode.bind(this)}
          autoFocus={autoFocus}
          options={editorOptions}
          ref={ref => (this.codeEditorRef = ref)}
        />
      </SafeWrapperStyled>
    );

    const footer = (
      <div className="footer-container">
        <Button
          className="btn"
          text={"Add"}
          intent={Intent.SUCCESS}
          disabled={!isCodeValid}
          onClick={this.onCodeSnippetAdd.bind(this)}
        />
        {
          <Popover
            popoverClassName="bp3-popover-content-sizing"
            isOpen={isWarningPopupOpen}
            targetBtn={
              <Button
                className="btn"
                intent={Intent.DANGER}
                onClick={this.onDiscardCodeClick.bind(this)}
              >
                Discard
              </Button>
            }
          >
            <div style={{ zIndex: 1000 }}>
              <h4>Are you sure you want to Discard Code?</h4>
              <p>All Code Will be Lost!</p>
              <div className="footer-container">
                {" "}
                <Button
                  className="btn"
                  intent={Intent.DANGER}
                  onClick={this.closeCodeEditor.bind(this)}
                >
                  OK
                </Button>
                <Button
                  className="btn"
                  intent={Intent.PRIMARY}
                  onClick={this.hideDiscardWarning.bind(this)}
                >
                  No, Continue
                </Button>{" "}
              </div>
            </div>
          </Popover>
        }
      </div>
    );

    return (
      <Popup
        icon={icon}
        isInline={false}
        usePortal={false}
        canOutsideClose={false}
        isDisabled={isDisabled}
        header={header}
        container={container}
        footer={footer}
        editor={editor}
        editorState={editorState}
        updateEditorState={updateEditorState}
        popupContainerStyle={{
          minWidth: "50em",
          maxWidth: "84em",
          minHeight: "25em",
          maxHeight: "32em",
          padding: 0
        }}
        containerStyle={{
          minHeight: "22em",
          maxHeight: "29em",
          padding: 0
        }}
        onCloseCross={this.onDiscardCodeClick.bind(this)}
        //onDidOpen={this.popupDidOpen.bind(this)}
        //onClose={this.cleanupEditor.bind(this)}
        ref={popup => {
          console.log("Popup Ref passed: ", popup);
          this.popup = popup;
        }}
      />
    );
  }

  private updateCode(newCode: string) {
    this.setState({ code: newCode });
  }

  private cleanupEditor() {
    this.setState({ code: null });
  }

  private onDiscardCodeClick() {
    const { code } = this.state;
    if (code && code.trim() !== "") this.showDiscardWarning();
    else this.closeCodeEditor();
  }

  private showDiscardWarning() {
    const { code } = this.state;
    this.setState({ isWarningPopupOpen: true });
  }

  private hideDiscardWarning() {
    this.setState({ isWarningPopupOpen: false });
  }

  private closeCodeEditor() {
    this.popup.closePopup();
  }

  //Open Code Editor with Code to Edit & Current Code Snippet Entity Key for Updating Entity Data
  OpenWithCode(entityKey: string, codeText: string) {
    //Set Default Editor's Code Text Value
    this.setState({
      code: codeText,
      isEditMode: true,
      codeEditorEntityKey: entityKey
    });
    //Open Current CodeEditor's Popup
    this.popup.openPopup();
  }

  //Submitting Code Snippet to Editor
  private onCodeSnippetAdd(e?: React.MouseEvent<HTMLAnchorElement>) {
    const { editorState, updateEditorState } = this.props;
    const { code, currentLanguage } = this.state;
    //Validate Code (NotEmpty)
    if (!code || code.trim() == "") return;
    //TODO: Display Errors using toasts
    let newEditorState = applyAtomicEntity(
      editorState,
      "CODE_SNIPPET",
      "MUTABLE",
      {
        code: code,
        language: currentLanguage ? currentLanguage : "javascript"
      }
    );
    //Update Editor State
    updateEditorState(newEditorState);

    //Close Editor Popup
    this.popup.closePopup();
  }

  //Update Code Snippet (when edit a snippet code)
  private onCodeSnippetUpdate() {
    //const newEntityInstance = Entity.mergeData("je", { data: "nme" });
    const { editorState, updateEditorState } = this.props;
    const { codeEditorEntityKey, currentLanguage, code } = this.state;
    //Update Entity data by merging it
    const newEditorState = mergeEntityData(
      editorState,
      Decorators(this.props.emit, this.props.on),
      codeEditorEntityKey,
      {
        code,
        language: currentLanguage ? currentLanguage : "javascript"
      }
    );
    //Update Editor State
    updateEditorState(newEditorState);
    //Close Code Editor Popup
    this.closeCodeEditor();
  }
}
