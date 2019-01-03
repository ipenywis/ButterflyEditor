import * as React from "react";

import { AppState } from "./store";

//Toolbar and Draft Editor
import Draft from "./components/draft";
import ToolBar from "./components/toolBar";

import { EventEmitter } from "events";

//Editor Config
import { EditorConfig, DEFAULT_CONFIG } from "./editorConfig";

export interface EditorProps {
  appState?: AppState;

  //Editor Configuration (Optional)
  config?: Partial<EditorConfig>;

  setAppState?: (newState: any, callback?: () => void) => void;
  setAppStateClb?: (callback: (prevState: AppState) => void) => void;
  getUniqueElementKey?: (alias?: string) => string;
  //Events
  on?: (
    eventName: string,
    handler: (appState?: AppState, ...args: any[]) => void
  ) => EventEmitter;
  emit?: (eventName: string, ...args: any[]) => boolean;
}

export interface EditorState {
  isEditorResizable: boolean;
  isEditorExpanded: boolean;
}

export default class Editor extends React.Component<EditorProps, EditorState> {
  state: EditorState;
  editorContainer: HTMLDivElement;
  private draft: Draft;

  static defaultProps = {
    config: DEFAULT_CONFIG
  };

  constructor(props: EditorProps) {
    super(props);
    this.state = {
      isEditorResizable: true,
      isEditorExpanded: false
    };
  }

  expandEditor() {
    /*
    DEFAULT Sizes: 
    maxWidth: 760px
    minHeight: 200px
    */
    //Editor Expand is Disabled!
    if (!this.props.config.allowEditorFullExpand) return;

    //Default initial Editor Sizes
    const DEFAULTS = { width: 760, height: 200 };

    this.setState(prevState => {
      if (prevState.isEditorExpanded) {
        //EDITOR IS ALREADY EXPANDED (TOGGLE IT)
        //Revert Position from fixed
        this.editorContainer.style.position = "initial";
        this.editorContainer.style.top = this.editorContainer.style.right = this.editorContainer.style.bottom = this.editorContainer.style.left = undefined;
        //Set EditorContainer Height & Width
        //this.editorContainer.style.maxWidth = DEFAULTS.width + "px";
        this.editorContainer.style.width =
          typeof DEFAULTS.width == "number"
            ? DEFAULTS.width + "px"
            : DEFAULTS.width;
        this.editorContainer.style.height = "auto";
        this.editorContainer.style.padding = "0px";
        //NOTE: Editor's width is auto fit the contaniner
        //Set Editor's Height
        this.draft.setEditorHeight(DEFAULTS.height + "px");
      } else {
        //EXPAND EDITOR
        //Fixed Position for document Overlay
        this.editorContainer.style.position = "fixed";
        this.editorContainer.style.maxHeight = this.editorContainer.style.maxWidth = undefined;
        this.editorContainer.style.top = this.editorContainer.style.right = this.editorContainer.style.bottom = this.editorContainer.style.left =
          "0";
        //Set EditorContainer Height & Width
        this.editorContainer.style.maxWidth = window.innerWidth + "px";
        this.editorContainer.style.width = window.innerWidth + "px";
        this.editorContainer.style.height = window.innerHeight + "px";
        this.editorContainer.style.padding = "3px";
        //NOTE: Editor's width is auto fit the contaniner
        //Set Editor's Height
        this.draft.setEditorHeight(window.innerHeight + "px");
      }
      //Toggle Expanded And Restrict Editor Resizing
      return {
        isEditorResizable: prevState.isEditorExpanded ? true : false,
        isEditorExpanded: !prevState.isEditorExpanded
      };
    });
  }

  public getHTML(): string {
    return this.draft.getHTML();
  }

  public getText(): string {
    return this.draft.getText();
  }

  public setInitialHeight(height: string) {
    this.draft.setEditorHeight(height);
  }

  public setFixedHeight(height: string) {
    //Disable Editor Resizing
    this.draft.disableEditorResize();
    //Set Height
    this.draft.setEditorHeight(height);
  }

  public setMaxHeight(maxHeight: string) {
    this.draft.setEditorMaxHeight(maxHeight);
  }

  public onChange(callback: (newText: string, HTML: string) => void) {
    this.draft.onTextChange(callback);
  }

  //TODO: Add MARKUP Export Support

  //TODO: Add Default Editor Startup Styles and Block Types
  render() {
    const { config } = this.props;

    return (
      <div
        className="editor-container"
        ref={editorContainer => (this.editorContainer = editorContainer)}
      >
        <ToolBar
          appState={this.props.appState}
          setAppState={this.props.setAppState}
          setAppStateClb={this.props.setAppStateClb}
          on={this.props.on}
          emit={this.props.emit}
          expandEditor={this.expandEditor.bind(this)}
          allowEditorExpand={config.allowEditorFullExpand}
          getUniqueElementKey={this.props.getUniqueElementKey}
        />
        <Draft
          appState={this.props.appState}
          isEditorResizable={
            this.state.isEditorResizable &&
            config.allowEditorFullExpand &&
            config.fixedHeight == null
          }
          allowHTMLExport={config.allowHTMLExport}
          setAppState={this.props.setAppState}
          on={this.props.on}
          emit={this.props.emit}
          ref={draft => (this.draft = draft)}
          height={
            config.fixedHeight ? config.fixedHeight : config.initialHeight
          }
          maxHeight={config.maxHeight}
        />
      </div>
    );
  }
}
