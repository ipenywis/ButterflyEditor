/*import * as React from "react";

//Popup
import Popup from "../../components/popup";

import Icon from "../../components/toolBar/icon";

import { Editor, EditorState } from "draft-js";

//Appstate
import { AppState } from "../../store";

//Events
import { EventEmitter } from "events";

//Style
import "./style.scss";

import Button from "../components/button";
import { Intent } from "../components/intent";
import Popover from "../components/popover";

//Entity
import {
  applyAtomicEntity,
  mergeEntityData
} from "../../components/draft/entity";

//Decorators
import Decorators from "../../components/draft/decorators";

//Prism Code Highlighter
import * as Prism from "prismjs";
import { addEntityImportRule } from "../../components/draft/importOptions";



//React Monaco Editor Comp
import MonacoEditor from "react-monaco-editor";

//Custom Languages (TEMP TEST) TODO: Move to Config File
import * as javascriptLanguage from "monaco-languages/release/esm/javascript/javascript.js";

interface CodeEditorProps {
  editorState: EditorState;
  editor: Editor;
  updateEditorState: (newEditorState: EditorState) => void;

  //is CodeEditor Disabled
  isDisabled?: boolean;

  //Events
  on?: (
    eventName: string,
    handler: (appState?: AppState, ...args: any[]) => void
  ) => EventEmitter;
  emit?: (eventName: string, ...args: any[]) => boolean;
}

interface CodeEditorState {
  allowDiscardNoWarning: boolean;
  isWarningOpen: boolean;
  preventSubmit: boolean;
  code: string;
  currentlanguage: string;
  isEditMode: boolean;
  codeEditorEntityKey: string; ///< Keep track of the Entity Key of the current Code Snippet Instance which to be changed/updated
}

//Monaco Programming Language Type Abstract
//type MonacoLanguage = any //MONACO_LANGUAGES.ILanguageExtensionPoint;

export class CodeEditor extends React.Component<
  CodeEditorProps,
  CodeEditorState
> {
  state: CodeEditorState;
  popup: Popup;
  //Code Editor Container
  editor: HTMLDivElement;
  //Editor Instance
  codeEditor: any;

  constructor(props: CodeEditorProps) {
    super(props);
    this.state = {
      allowDiscardNoWarning: true,
      isWarningOpen: false,
      preventSubmit: true,
      code: null,
      currentlanguage: "javascript", ///< Javascript by default
      isEditMode: false,
      codeEditorEntityKey: null
    };
  }

  monacoEditorWillMount(monaco: any) {
    monaco.languages.register({ id: "javascript" });

    //let jsLang: MONACO_LANGUAGES.IMonarchLanguage = javascriptLanguage.language as MONACO_LANGUAGES.IMonarchLanguage;
    let jsLang: any = javascriptLanguage.language as any;
    monaco.languages.setMonarchTokensProvider("javascript", jsLang);

    //monaco.languages.setLanguageConfiguration()
  }

  monacoEditorDidMount(
    //editor: MONACO_EDITOR.IStandaloneCodeEditor,
    editor: any,
    monaco: any
  ) {
    monaco.editor.setModelLanguage(editor.getModel(), "javascript");

    editor.onDidChangeModelContent(this.validateCode.bind(this));
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
  onCodeSnippetAdd(e?: React.MouseEvent<HTMLAnchorElement>) {
    const { editorState, updateEditorState } = this.props;
    //Validate Code (NotEmpty)
    if (!this.codeEditor.getValue() || this.codeEditor.getValue().trim() == "")
      return;
    //TODO: Display Errors using toasts
    let newEditorState = applyAtomicEntity(
      editorState,
      "CODE_SNIPPET",
      "MUTABLE",
      {
        code: this.codeEditor.getValue(),
        language: this.state.currentlanguage
          ? this.state.currentlanguage
          : "javascript"
      }
    );
    //Update Editor State
    updateEditorState(newEditorState);

    //Close Editor Popup
    this.popup.closePopup();
  }

  //Update Code Snippet (when edit a snippet code)
  onCodeSnippetUpdate() {
    //const newEntityInstance = Entity.mergeData("je", { data: "nme" });
    const { editorState, updateEditorState } = this.props;
    const { codeEditorEntityKey, currentlanguage, code } = this.state;
    //Update Entity data by merging it
    const newEditorState = mergeEntityData(
      editorState,
      Decorators(this.props.emit, this.props.on),
      codeEditorEntityKey,
      {
        code,
        language: currentlanguage ? currentlanguage : "javascript"
      }
    );
    //Update Editor State
    updateEditorState(newEditorState);
    //Close Code Editor Popup
    this.popup.closePopup();
  }

  handleKeyPress(e: React.KeyboardEvent) {
    //Submit Code Snippet on Return Key
    //if (e.key == "Enter") this.onCodeSnippetAdd();
  }

  updateCurrentLanguage(e: React.ChangeEvent<HTMLSelectElement>) {
    //Update State
    this.setState({ currentlanguage: e.currentTarget.value });
  }

  componentWillMount() {
    //Listen For Code Editing Event from a Code Snippet Decorator
    this.props.on("EditCode", (appState, data) => {
      //Open Popup WITH CODE
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

  onDiscardCode() {
    //Show Warning before Discard or just exist
    if (!this.state.allowDiscardNoWarning)
      this.setState({ isWarningOpen: true });
    else {
      this.setState({ isWarningOpen: false });
      this.popup.closePopup();
    }
  }

  onCloseCrossClick(e: React.MouseEvent<any>) {
    this.onDiscardCode();
  }

  validateCode(code: string) {
    //Validate Code Make sure it's (NotEmpty)
    if (!code || code === "" || code.trim() === "")
      this.setState({ preventSubmit: true, allowDiscardNoWarning: true });
    else this.setState({ preventSubmit: false, allowDiscardNoWarning: false });
  }

  onCodeEditorValueChange(newCodeValue: string) {
    this.setState({ code: newCodeValue }, () => {
      this.validateCode(newCodeValue);
    });
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
    const { code, currentlanguage, isEditMode } = this.state;

    let popupInline = false;

    //Icon
    const icon = <Icon icon={"codeEditor"} />;

    //Header
    const header = "Code Editor";

    //Only show the supported languages by the prism code highlighter (at least for now!)
    const prismSupportedLanguages: string[] = Object.keys(Prism.languages);

    const DEFAULT_CODE_EDITOR_SIZE = {
      width: "100%",
      minHeight: "28em",
      maxHeight: "30em"
    };

    //Container
    const container = (
      <div
        style={{ width: "100%" }}
        onKeyPress={this.handleKeyPress.bind(this)}
      >
        <div className="language-select-container">
          <select onChange={this.updateCurrentLanguage.bind(this)}>
            {prismSupportedLanguages.map((lang, idx) => {
              return <option key={lang}>{lang}</option>;
            })}
          </select>
        </div>
        <div
          id="code-editor"
          style={{
            minHeight: DEFAULT_CODE_EDITOR_SIZE.minHeight,
            maxHeight: DEFAULT_CODE_EDITOR_SIZE.maxHeight
          }}
        >
          {
            <MonacoEditor
              theme="vs-dark"
              language="javascript"
              value={code}
              onChange={this.onCodeEditorValueChange.bind(this)}
              ref={codeEditor =>
                codeEditor
                  ? (this.codeEditor = (codeEditor as any).editor)
                  : null
              }
              width={DEFAULT_CODE_EDITOR_SIZE.width}
              height={DEFAULT_CODE_EDITOR_SIZE.minHeight}
              editorWillMount={this.monacoEditorWillMount.bind(this)}
              editorDidMount={this.monacoEditorDidMount.bind(this)}
            />
          }
        </div>
      </div>
    );

    //Footer
    const footer = (
      <div className="footer-container">
        <Button
          className="btn"
          text={isEditMode ? "Update Snippet" : "Add Snippet"}
          intent={Intent.SUCCESS}
          disabled={this.state.preventSubmit}
          onClick={
            isEditMode
              ? this.onCodeSnippetUpdate.bind(this)
              : this.onCodeSnippetAdd.bind(this)
          }
        />
        {
          <Popover
            popoverClassName="bp3-popover-content-sizing"
            isOpen={this.state.isWarningOpen}
            targetBtn={
              <Button
                className="btn"
                intent={Intent.DANGER}
                onClick={this.onDiscardCode.bind(this)}
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
                  onClick={() => {
                    this.setState({ isWarningOpen: false });
                    this.popup.closePopup();
                  }}
                >
                  OK
                </Button>
                <Button
                  className="btn"
                  intent={Intent.PRIMARY}
                  onClick={() => this.setState({ isWarningOpen: false })}
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
        isInline={popupInline}
        isDisabled={isDisabled}
        usePortal={false}
        canOutsideClose={false}
        icon={icon}
        editorState={editorState}
        updateEditorState={updateEditorState}
        editor={editor}
        on={on}
        emit={emit}
        header={header}
        popupContainerStyle={{
          minWidth: "70em",
          maxWidth: "84em",
          minHeight: "38em",
          maxHeight: "43em",
          padding: 0
        }}
        containerStyle={{
          minHeight: "28em",
          maxHeight: "30em",
          padding: 0
        }}
        onCloseCross={this.onCloseCrossClick.bind(this)}
        container={container}
        footer={footer}
        ref={popup => (this.popup = popup)}
      />
    );
  }
}
*/
