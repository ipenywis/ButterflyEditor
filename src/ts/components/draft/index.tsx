import * as React from "react";

/* DRAFT: TEXT EDITOR */

//Draftjs
import {Editor, EditorState} from "draft-js";

import {AppState} from "../../store";

export interface DraftProps {
  appState
    ?
    : AppState;

  setAppState
    ?
    : (newState : any, callback?: () => void) => void;
}

export interface DraftState {}

export default class Draft extends React.Component < DraftProps,
DraftState > {

  state : DraftState;

  constructor(props : DraftProps) {
    super(props);
    this.state = {};
  }

  updateDraftEditor(newEditorState : EditorState) {
    //Update Editor State
    this
      .props
      .setAppState({editorState: newEditorState});
  }

  render() {
    //Quick Extract
    let {appState, setAppState} = this.props;

    return (
      <div className="draft">
        <div className="draft-container">
          <Editor
            editorState={appState.editorState}
            onChange={this
            .updateDraftEditor
            .bind(this)}/>
        </div>
      </div>
    );

  }

}