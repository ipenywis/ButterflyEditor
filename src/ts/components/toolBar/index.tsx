import * as React from "react";

import { AppState } from "../../store";

import * as _ from "lodash";

import { initToolbarItems } from "./toolConfig";

import Controls, { InlineStyle, BlockType } from "./controls";
import { EditorState } from "draft-js";

import { EventEmitter } from "events";

//Icons
import { Icon } from "react-icons-kit";
import { expand } from "react-icons-kit/fa/";

export interface ToolBarProps {
  appState?: AppState;

  setAppState?: (newState: any, callback?: () => void) => void;
  setAppStateClb?: (callback: (prevState: AppState) => void) => void;
  //Events
  on?: (
    eventName: string,
    handler: (appState?: AppState, ...args: any[]) => void
  ) => EventEmitter;
  emit?: (eventName: string, ...args: any[]) => boolean;
  expandEditor: () => void;
}

export interface ToolBarState {
  toolbarItems: { inlineStyles: InlineStyle[]; blockTypes: BlockType[] };
}

export default class ToolBar extends React.Component<ToolBarProps> {
  state: ToolBarState;

  //Default ToolBar Icon Style
  static defaultIconStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  };

  constructor(props: ToolBarProps) {
    super(props);
    this.state = {
      toolbarItems: null
    };
  }

  updateEditorState(newEditorState: EditorState, callback?: () => void) {
    this.props.setAppState(
      {
        editorState: newEditorState
      },
      callback
    );
  }

  //Show or Hide HTML View
  toggleDraftHTMLView(): boolean {
    //Check the state of the current enabled property to let the toolbar know if the current btn is active or not
    //Switch View (Draft/HTML)
    this.props.setAppStateClb(prevState => ({
      showDraftHTML: !prevState.showDraftHTML
    }));
    //Is it Active
    return true;
  }

  componentWillMount() {
    const { appState, on, emit } = this.props;

    //Initialize Toolbar Items
    initToolbarItems(
      appState,
      on,
      emit,
      this.updateEditorState.bind(this),
      this.toggleDraftHTMLView.bind(this)
    ).then(toolbarItems => {
      if (toolbarItems) this.setState({ toolbarItems });
    });
  }

  render() {
    //TODO: Export This on a CONFIG object and allow it as a Creation API for users

    const { toolbarItems } = this.state;
    if (toolbarItems)
      return (
        <div className="toolbar">
          <Controls
            appState={this.props.appState}
            setAppState={this.props.setAppState}
            inlineStyles={toolbarItems.inlineStyles}
            blockTypes={toolbarItems.blockTypes}
            updateEditorState={this.updateEditorState.bind(this)}
            on={this.props.on}
            emit={this.props.emit}
          />
          <span
            id="expand-editor-btn"
            className="expand-editor"
            onClick={this.props.expandEditor}
          >
            <Icon icon={expand} size={15} />
          </span>
        </div>
      );
    return null;
    //Loading Error! Dont' Render Editor Toolbar
    //console.error("Cannot Render Toolbar!, Please Refresh & Try Again");
  }
}
