import * as React from "react";

import {EditorState} from "draft-js";

//Shared State Between Childrens
export interface AppState {
  editorState : EditorState;
}

export interface AppProps {}

export default class Store extends React.Component {

  constructor(props : AppProps) {
    super(props);

    //Main App State (Default State)
    this.state = {
      editorState: EditorState.createEmpty()
    };
    //Register Bindings
    this.setAppState = this
      .setAppState
      .bind(this);
  }

  setAppState(newState : any, callback : () => void) {
    this.setState(newState, callback);
  }

  render() {

    return (
      <div className="main-container">
        {React
          .Children
          .map(this.props.children, (child, idx) => {
            return React.cloneElement(child as React.ReactElement < any >, {
              appState: this.state,
              setAppState: this.setAppState
            });
          })}
      </div>
    );

  }

}