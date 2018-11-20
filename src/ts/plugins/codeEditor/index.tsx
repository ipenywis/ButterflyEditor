import * as React from "react";

//Popup
import Popup from "../../components/popup";

import { Icon } from "react-icons-kit";
import { terminal } from "react-icons-kit/fa/";

import { Editor, EditorState } from "draft-js";

//Appstate
import { AppState } from "../../store";

//Events
import { EventEmitter } from "events";

//Style
import "./style.scss";
//Blueprint
import {
  AnchorButton,
  Intent,
  Popover,
  Position,
  PopoverInteractionKind,
  MenuItem
} from "@blueprintjs/core";
//Blueprint Select
import { Select, ItemRenderer, ItemPredicate } from "@blueprintjs/select";

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

//Monaco
/*import {
  languages as MONACO_LANGUAGES,
  editor as MONACO_EDITOR
} from "monaco-editor";
*/
import * as MONACO from "monaco-editor";
//React Monaco Editor Comp
import MonacoEditor from "react-monaco-editor";

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
type MonacoLanguage = MONACO.languages.ILanguageExtensionPoint;

//Monaco Programming Languages Select Renderer
const LanguagesRenderer: ItemRenderer<string> = (
  language,
  { handleClick, modifiers }
) => {
  /*if (!(modifiers as any).filtered) {
    return null;
  }*/
  return (
    <MenuItem
      active={modifiers.active}
      key={language}
      label={language}
      text={language}
      onClick={handleClick}
    />
  );
};

//Monaco Languages Predicte Filter
const filterLanguages: ItemPredicate<string> = (query, language) => {
  //Tell if the query string exists in the languages Array (Search Using Language ID or Most Releavent Aliase)
  //If using Monaco Editor Supported Languages (use Monacolanguage) but for now we only need
  //the supported Prism languages (which could be highlighted)
  /*return (
    language.aliases[0].toLowerCase().indexOf(query.toLowerCase()) >= 0 ||
    language.id.toLowerCase().indexOf(query.toLowerCase()) >= 0
  );*/
  return language.toLowerCase().indexOf(query.toLowerCase()) >= 0;
};

export default class CodeEditor extends React.Component<
  CodeEditorProps,
  CodeEditorState
> {
  state: CodeEditorState;
  popup: Popup;
  //Code Editor Container
  editor: HTMLDivElement;
  //Editor Instance
  codeEditor: MONACO.editor.IStandaloneCodeEditor;

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

  onOpen() {
    const { code, currentlanguage } = this.state;
    //Get Monaco Editor Reference
    this.codeEditor = (this.refs.monaco as any).editor.getModel();

    //Register Code Editor Specific Events
    this.codeEditor.onDidChangeModelContent(modal => {
      //Validate Code Make sure it's (NotEmpty)
      if (!code || code.trim() == "")
        this.setState({ preventSubmit: true, allowDiscardNoWarning: true });
      else
        this.setState({ preventSubmit: false, allowDiscardNoWarning: false });
    });
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

  updateCurrentLanguage(language: string) {
    //Update Monaco Editor Model
    (this.refs.monaco as any).editor.setModelLanguage(
      this.codeEditor.getModel(),
      language
    );
    //Update State
    this.setState({ currentlanguage: language });
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
      this.setState({ isWarningOpen: true });
      this.popup.closePopup();
    }
  }

  onCodeEditorValueChange(newCodeValue: string) {
    this.setState({ code: newCodeValue });
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
    const icon = <Icon icon={terminal} />;

    //Header
    const header = "Code Editor";

    //Available Code Editor Programming Languages
    const LanguagesSelect = Select.ofType<string>();
    const monacoLanguages = MONACO.languages.getLanguages();
    //Only show the supported languages by the prism code highlighter (at least for now!)
    const prismSupportedLanguages: string[] = Object.keys(Prism.languages);

    //Container
    const container = (
      <div onKeyPress={this.handleKeyPress.bind(this)}>
        <div className="language-select-container">
          <LanguagesSelect
            items={prismSupportedLanguages}
            itemPredicate={filterLanguages}
            itemRenderer={LanguagesRenderer}
            noResults={<MenuItem disabled={true} text="No results." />}
            onItemSelect={this.updateCurrentLanguage.bind(this)}
          >
            <AnchorButton
              text={currentlanguage}
              rightIcon={"double-caret-vertical"}
            />
          </LanguagesSelect>
        </div>
        <div
          id="code-editor"
          style={{
            minHeight: "28em",
            maxHeight: "30em"
          }}
        >
          <MonacoEditor
            language={currentlanguage}
            theme={"vs-dark"}
            value={code}
            onChange={this.onCodeEditorValueChange.bind(this)}
            ref="monaco"
          />
        </div>
      </div>
    );

    //Footer
    const footer = (
      <div className="footer-container">
        <AnchorButton
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
        <Popover
          interactionKind={PopoverInteractionKind.CLICK}
          popoverClassName="bp3-popover-content-sizing"
          position={Position.TOP}
          isOpen={this.state.isWarningOpen}
        >
          <AnchorButton
            className="btn"
            intent={Intent.DANGER}
            onClick={this.onDiscardCode.bind(this)}
          >
            Discard
          </AnchorButton>
          <div style={{ zIndex: 1000 }}>
            <h4>Are you sure you want to Discard Code?</h4>
            <p>All Code Will be Lost!</p>
            <div className="footer-container">
              {" "}
              <AnchorButton
                className="btn"
                intent={Intent.DANGER}
                onClick={() => {
                  this.setState({ isWarningOpen: false });
                  this.popup.closePopup();
                }}
              >
                OK
              </AnchorButton>
              <AnchorButton
                className="btn"
                intent={Intent.PRIMARY}
                onClick={() => this.setState({ isWarningOpen: false })}
              >
                No, Continue
              </AnchorButton>{" "}
            </div>
          </div>
        </Popover>
      </div>
    );

    /*
              <Popover
          isOpen={this.state.isWarningOpen}
          target={
            <AnchorButton
              className="btn"
              text="Discard"
              intent={Intent.DANGER}
              onClick={() => this.setState({ isWarningOpen: true })}
            />
          }
        >
          <div>Are you sure you want to Discard Code?</div>
          <AnchorButton
            text="No, Continue"
            intent={Intent.PRIMARY}
            onClick={() => this.setState({ isWarningOpen: false })}
          />
          <AnchorButton
            text="Discard"
            intent={Intent.DANGER}
            onClick={() => this.popup.closePopup()}
          />
        </Popover>
      */

    //Popup
    return (
      <Popup
        isInline={popupInline}
        isDisabled={isDisabled}
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
        onCloseCross={() => this.setState({ isWarningOpen: true })}
        container={container}
        footer={footer}
        didOpen={this.onOpen.bind(this)}
        ref={popup => (this.popup = popup)}
      />
    );
  }
}
