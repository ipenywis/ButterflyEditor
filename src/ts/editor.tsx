import * as React from "react";

import {AppState} from "./store";

//Toolbar and Draft Editor
import Draft from "./components/draft";
import ToolBar from "./components/toolBar";

export interface EditorProps {
  appState?: AppState;

  setAppState?: (newState : any, callback?: () => void) => void;
}

export interface EditorState {}

export default class Editor extends React.Component < EditorProps,
EditorState > {

  constructor(props : EditorProps) {
    super(props);
    this.state = {};
  }

  render() {

    return (
      <div className="editor-container">
        <ToolBar appState={this.props.appState} setAppState={this.props.setAppState}/>
        <Draft appState={this.props.appState} setAppState={this.props.setAppState}/>
      </div>
    );

  }

}