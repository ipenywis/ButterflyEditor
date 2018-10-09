import * as React from "react";

import { AppState } from "./store";

//Toolbar and Draft Editor
import Draft from "./components/draft";
import ToolBar from "./components/toolBar";

import {
  Editor as ED,
  EditorState as EDS,
  RichUtils,
  Modifier
} from "draft-js";
import { EventEmitter } from "events";

export interface EditorProps {
  appState?: AppState;

  setAppState?: (newState: any, callback?: () => void) => void;
  setAppStateClb?: (callback: (prevState: AppState) => void) => void;
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
  draft: Draft;

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
    maxWidth: 1100px
    minHeight: 200px
    */

    //Default initial Editor Sizes
    const DEFAULTS = { width: 1100, height: 200 };

    this.setState(prevState => {
      if (prevState.isEditorExpanded) {
        //EDITOR IS ALREADY EXPANDED (TOGGLE IT)
        //Set EditorContainer Height & Width
        this.editorContainer.style.maxWidth = DEFAULTS.width + "px";
        this.editorContainer.style.width = DEFAULTS.width + "px";
        this.editorContainer.style.height = "auto";
        this.editorContainer.style.padding = "0px";
        //NOTE: Editor's width is auto fit the contaniner
        //Set Editor's Height
        this.draft.setEditorHeight(DEFAULTS.height + "px");
      } else {
        //EXPAND EDITOR
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

  //TODO: Add Default Editor Startup Styles and Block Types
  render() {
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
        />
        <Draft
          appState={this.props.appState}
          isEditorResizable={this.state.isEditorResizable}
          setAppState={this.props.setAppState}
          on={this.props.on}
          emit={this.props.emit}
          ref={draft => (this.draft = draft)}
        />
      </div>
    );
  }
}
