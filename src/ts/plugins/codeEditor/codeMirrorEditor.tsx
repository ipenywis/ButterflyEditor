import * as React from "react";
import { Controlled as CodeMirror, ICodeMirror } from "react-codemirror2";
//CodeMirror Style
import "codemirror/lib/codemirror.css";
//CodeMirror Dracula Theme
import "codemirror/theme/dracula.css";
import Icon from "../../components/toolBar/icon";
import { SafeWrapper } from "../../components/common";
import Popover from "../components/popover";
import Button from "../components/button";
import DropDown from "../../components/toolBar/dropDown";
import { Intent } from "../components/intent";
import Popup from "../../components/popup";
import { EditorState, Editor, SelectionState, Modifier } from "draft-js";
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
//CodeMirror Config
import {
  CODE_EDITOR_LANGUAGES,
  getCodeMirrorLanguages,
  getCodeMirrorLanguage
} from "./codeMirrorConfig";

const CodeMirrorStyled = styled(CodeMirror)`
  width: 100%;
`;

const SafeWrapperStyled = styled(SafeWrapper)`
  max-width: 60em;
  min-width: 50em;
  flex-direction: column;
`;

const LanguageSelectContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  margin-bottom: 20px;
  & > label {
    font-size: 20px;
    color: rgba(15, 15, 15, 0.9);
    margin-right: 10px;
  }
`;

const Select = styled.select`
  box-shadow: 0px 0px 2px 0.7px rgba(60, 134, 222, 0.73);
  min-width: 8em;
  max-width: 12em;
  height: 22px;
  font-size: 12px;
  color: #1b1a1a;
  border: 0;
  border-radius: 3px;
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
  isDeleteCodePopupOpen: boolean;
  isEditMode: boolean;
  didCodeChange: boolean; ///< works in update mode to know if code has been changed or not
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
  private codeEditorInstance: ICodeMirror;

  static defaultProps = {
    autoFocus: true
  };

  constructor(props: CodeMirrorEditorProps) {
    super(props);
    this.state = {
      code: null,
      isWarningPopupOpen: false,
      isEditMode: false,
      didCodeChange: false,
      codeEditorEntityKey: null,
      currentLanguage: "javascript",
      isDeleteCodePopupOpen: false
    };
  }

  popupDidOpen() {
    this.codeEditorInstance = (this.codeEditorRef as any).getCodeMirror();
    /*this.codeEditorInstance.on("change", () => {
    });*/
  }

  componentWillMount() {
    //Listen For Code Editing Event from a Code Snippet Decorator
    this.props.on("EditCode", (appState, data) => {
      //Open Popup WITH CODE (Event is being emitted from the Decorator)
      this.OpenWithCode(data[0], data[1]);
    });

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

  public render() {
    const {
      editor,
      editorState,
      updateEditorState,
      isDisabled,
      autoFocus
    } = this.props;
    const {
      code,
      isWarningPopupOpen,
      isDeleteCodePopupOpen,
      isEditMode,
      didCodeChange,
      currentLanguage
    } = this.state;

    const icon = <Icon icon={"codeEditor"} />;

    const header = "Code Mirror Editor";

    const editorOptions: any = {
      mode: currentLanguage,
      theme: "dracula"
    };

    const container = (
      <SafeWrapperStyled>
        <LanguageSelectContainer className="language-select-container">
          <label htmlFor="language-select">Current Language: </label>
          <DropDown
            className={"t-dropDown"}
            label="Language"
            showActiveOption={true}
            onChange={this.updateCurrentLanguage.bind(this)}
            container="button"
            editorState={editorState}
          >
            {CODE_EDITOR_LANGUAGES.map(lang => {
              return lang;
            })}
          </DropDown>
        </LanguageSelectContainer>
        <CodeMirrorStyled
          value={code}
          onBeforeChange={this.updateCode.bind(this)}
          options={editorOptions}
          ref={ref => (this.codeEditorRef = ref)}
        />
      </SafeWrapperStyled>
    );

    const footer = (
      <div style={{ padding: "8px" }}>
        <Button
          className="btn"
          text={isEditMode ? "Update" : "Add"}
          intent={Intent.SUCCESS}
          disabled={!didCodeChange}
          onClick={
            isEditMode
              ? this.onCodeSnippetUpdate.bind(this)
              : this.onCodeSnippetAdd.bind(this)
          }
        />
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
        {isEditMode && (
          <Popover
            isOpen={isDeleteCodePopupOpen}
            targetBtn={
              <Button
                className="btn"
                intent={Intent.DANGER}
                onClick={this.onDeleteCodePopupClick.bind(this)}
              >
                Remove Snippet
              </Button>
            }
          >
            <div style={{ zIndex: 1000 }}>
              <h4>Are you sure you want to Delete this Code Snippet?</h4>
              <p>The Snippet will be completely removed!</p>
              <div className="footer-container">
                <Button
                  className="btn"
                  intent={Intent.DANGER}
                  onClick={this.deleteCodeSnippet.bind(this)}
                >
                  Remove
                </Button>
                <Button
                  className="btn"
                  intent={Intent.PRIMARY}
                  onClick={this.hideDeleteCodePopup.bind(this)}
                >
                  Cancel
                </Button>{" "}
              </div>
            </div>
          </Popover>
        )}
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
        onClose={this.cleanupEditor.bind(this)}
        ref={popup => (this.popup = popup)}
      />
    );
  }

  private updateCode(editor: ICodeMirror, data: any, newCode: string) {
    const { didCodeChange } = this.state;
    if (!didCodeChange) this.setState({ code: newCode, didCodeChange: true });
    else this.setState({ code: newCode });
  }

  private updateCurrentLanguage(language: string) {
    this.setState({ currentLanguage: getCodeMirrorLanguage(language) });
  }

  private cleanupEditor() {
    this.setState({
      code: null,
      isWarningPopupOpen: false,
      isEditMode: false,
      didCodeChange: false,
      currentLanguage: "javascript"
    });
  }

  private onDiscardCodeClick() {
    const { didCodeChange } = this.state;
    if (didCodeChange) this.showDiscardWarning();
    else this.closeCodeEditor();
  }

  private onDeleteCodePopupClick() {
    const { code, isEditMode } = this.state;
    if (code && code.trim() !== "" && isEditMode) this.showDeleteCodePopup();
  }

  private showDiscardWarning() {
    this.setState({ isWarningPopupOpen: true });
  }

  private hideDiscardWarning() {
    this.setState({ isWarningPopupOpen: false });
  }

  private showDeleteCodePopup() {
    this.setState({ isDeleteCodePopupOpen: true });
  }

  private hideDeleteCodePopup() {
    this.setState({ isDeleteCodePopupOpen: false });
  }

  private closeCodeEditor() {
    this.popup.closePopup();
  }

  private deleteCodeSnippet() {
    const { editorState, updateEditorState } = this.props;
    const { codeEditorEntityKey } = this.state;

    const contentState = editorState.getCurrentContent();
    contentState.getBlockMap().map(block => {
      block.findEntityRanges(
        character => {
          return character.getEntity() === codeEditorEntityKey;
        },
        (start: number, end: number) => {
          const entity = block.getEntityAt(start);
          const selection = SelectionState.createEmpty(block.getKey());
          //Create a selection fro the range of the entity
          const autoSelectedCodeRange = selection.merge({
            anchorOffset: 0,
            focusOffset: block.getText().length
          });
          const newContentState = Modifier.applyEntity(
            contentState,
            autoSelectedCodeRange as SelectionState,
            null
          );
          const newEditorState = EditorState.createWithContent(
            newContentState,
            Decorators(this.props.emit, this.props.on)
          );
          updateEditorState(newEditorState);
          this.closeCodeEditor();
        }
      );
    });
  }

  //Open Code Editor with Code to Edit & Current Code Snippet Entity Key for Updating Entity Data
  private OpenWithCode(entityKey: string, codeText: string) {
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
