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

export interface EditorState {}

export default class Editor extends React.Component<EditorProps, EditorState> {
  state: EditorState;

  constructor(props: EditorProps) {
    super(props);
  }
  //TODO: Add Default Editor Startup Styles and Block Types
  render() {
    return (
      <div className="editor-container">
        <ToolBar
          appState={this.props.appState}
          setAppState={this.props.setAppState}
          setAppStateClb={this.props.setAppStateClb}
          on={this.props.on}
          emit={this.props.emit}
        />
        <Draft
          appState={this.props.appState}
          setAppState={this.props.setAppState}
          on={this.props.on}
          emit={this.props.emit}
        />
      </div>
    );
  }
}
