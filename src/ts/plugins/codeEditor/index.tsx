import * as React from "react";

//Popup
import Popup from "../../components/popup";

import { Icon } from "react-icons-kit";
import { terminal } from "react-icons-kit/fa/";

import { Editor, EditorState, SelectionState } from "draft-js";

//Appstate
import { AppState } from "../../store";

//Events
import { EventEmitter } from "events";

//Monaco Microsoft VSCode Code Editor
import * as monaco from "monaco-editor";

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
import { applyAtomicEntity } from "../../components/draft/entity";

interface CodeEditorProps {
  editorState: EditorState;
  editor: Editor;
  updateEditorState: (newEditorState: EditorState) => void;

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
  defaultEditorValue: string;
  currentlanguage: string;
}

//Monaco Programming Language Type Abstract
type MonacoLanguage = monaco.languages.ILanguageExtensionPoint;

//Monaco Programming Languages Select Renderer
const LanguagesRenderer: ItemRenderer<MonacoLanguage> = (
  language,
  { handleClick, modifiers }
) => {
  /*if (!(modifiers as any).filtered) {
    return null;
  }*/
  return (
    <MenuItem
      active={modifiers.active}
      key={language.id}
      label={language.aliases[0]}
      text={language.id}
      onClick={handleClick}
    />
  );
};

//Monaco Languages Predicte Filter
const filterLanguages: ItemPredicate<MonacoLanguage> = (query, language) => {
  //Tell if the query string exists in the languages Array (Search Using Language ID or Most Releavent Aliase)
  return (
    language.aliases[0].toLowerCase().indexOf(query.toLowerCase()) >= 0 ||
    language.id.toLowerCase().indexOf(query.toLowerCase()) >= 0
  );
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
  codeEditor: monaco.editor.IStandaloneCodeEditor;

  constructor(props: CodeEditorProps) {
    super(props);
    this.state = {
      allowDiscardNoWarning: true,
      isWarningOpen: false,
      preventSubmit: true,
      defaultEditorValue: null,
      currentlanguage: "javascript" ///< Javascript by default
    };
  }

  onOpen() {
    const { defaultEditorValue, currentlanguage } = this.state;
    //Create and Add Monaco Editor to #code-editor Container
    /*SAMPLE VALUE: ["function x() {", '\tconsole.log("Hello world!");', "}"].join(
        "\n"
        )*/
    this.codeEditor = monaco.editor.create(this.editor, {
      value: defaultEditorValue,
      theme: "vs-dark",
      language: currentlanguage
    });
    //Register Code Editor Specific Events
    this.codeEditor.onDidChangeModelContent(modal => {
      //Validate Code Make sure it's (NotEmpty)
      if (
        !this.codeEditor.getValue() ||
        this.codeEditor.getValue().trim() == ""
      )
        this.setState({ preventSubmit: true, allowDiscardNoWarning: true });
      else
        this.setState({ preventSubmit: false, allowDiscardNoWarning: false });
    });
  }

  //Open Code Editor with Code to Edit
  OpenWithCode(codeText: string) {
    //Set Default Editor's Code Text Value
    this.setState({ defaultEditorValue: codeText });
    //Open Current CodeEditor's Popup
    this.popup.openPopup();
  }

  //Submitting Code Snippet to Editor
  onCodeSnippetAdd(e?: React.MouseEvent<HTMLAnchorElement>) {
    const { editorState, updateEditorState } = this.props;
    //Validate Code (NotEmpty)
    if (!this.codeEditor.getValue() || this.codeEditor.getValue().trim() == "")
      return;
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
    console.log("VALUE: ", this.codeEditor.getValue());
    //this.props.editor.focus();
    //Update Editor State
    updateEditorState(newEditorState);

    //Close Editor Popup
    this.popup.closePopup();
  }

  handleKeyPress(e: React.KeyboardEvent) {
    //Submit Code Snippet on Return Key
    //if (e.key == "Enter") this.onCodeSnippetAdd();
  }

  updateCurrentLanguage(language: MonacoLanguage) {
    //Update Monaco Editor Model
    monaco.editor.setModelLanguage(this.codeEditor.getModel(), language.id);
    //Update State
    this.setState({ currentlanguage: language.id });
  }

  componentWillMount() {
    //Listen For Code Editing Event from a Code Snippet Decorator
    let events = this.props.on("EditCode", (appState, codeText) => {
      //Open Popup WITH CODE
      this.OpenWithCode(codeText[0]);
    });
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

  render() {
    const { editorState, updateEditorState, editor, on, emit } = this.props;
    const { currentlanguage } = this.state;

    let popupInline = false;

    //Icon
    const icon = <Icon icon={terminal} />;

    //Header
    const header = "Code Editor";

    //Available Code Editor Programming Languages
    const LanguagesSelect = Select.ofType<MonacoLanguage>();
    const monacoLanguages = monaco.languages.getLanguages();

    //Container
    const container = (
      <div onKeyPress={this.handleKeyPress.bind(this)}>
        <div className="language-select-container">
          <LanguagesSelect
            items={monacoLanguages}
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
          ref={editor => (this.editor = editor)}
        />
      </div>
    );

    //Footer
    const footer = (
      <div className="footer-container">
        <AnchorButton
          className="btn"
          text="Add Snippet"
          intent={Intent.SUCCESS}
          disabled={this.state.preventSubmit}
          onClick={this.onCodeSnippetAdd.bind(this)}
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
