import * as React from "react";

import {AppState} from "../../store";

import {RichUtils, convertToRaw} from "draft-js";

import * as draftToHtml from "draftjs-to-html";

interface BaseComponentProps {
  appState?: AppState;

  setAppState?: (newState : any, callback?: () => void) => void;
}

export function toggleBoldStyle(self : React.Component < BaseComponentProps >, active = true) : void {
  let {appState, setAppState} = self.props;
  // console.log(draftToHtml(convertToRaw(appState.editorState.getCurrentContent())
  // ));
  let currentInlineStyle = appState
    .editorState
    .getCurrentInlineStyle();
  let newEditorState = RichUtils.toggleInlineStyle(appState.editorState, "BOLD");
  setAppState({editorState: newEditorState});
}