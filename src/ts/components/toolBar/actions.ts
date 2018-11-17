/* CURRENTLY_NOT_NEEDED

import * as React from "react";

import { AppState } from "../../store";

import {
  RichUtils,
  convertToRaw,
  EditorState,
  ContentState,
  SelectionState,
  Modifier
} from "draft-js";

import * as draftToHtml from "draftjs-to-html";

interface BaseComponentProps {
  appState?: AppState;

  setAppState?: (newState: any, callback?: () => void) => void;
}

export function toggleBoldStyle(
  self: React.Component<BaseComponentProps>,
  active = true
): void {
  let { appState, setAppState } = self.props;

  let currentInlineStyle = appState.editorState.getCurrentInlineStyle();
  let newEditorState = RichUtils.toggleInlineStyle(
    appState.editorState,
    "BOLD"
  );
  setAppState({ editorState: newEditorState });
}

*/
