import * as React from "react";
import { AppState } from "../../store";
import { initToolbarItemsSync } from "./toolConfig";
import Controls, { InlineStyle, BlockType } from "./controls";
import { EditorState } from "draft-js";
import { EventEmitter } from "events";
import Icon from "./icon";

export interface ToolBarProps {
  appState?: AppState;
  allowEditorExpand?: boolean;

  setAppState?: (newState: any, callback?: () => void) => void;
  setAppStateClb?: (callback: (prevState: AppState) => void) => void;
  getUniqueElementKey: (alias?: string) => string;

  //Events
  on?: (
    eventName: string,
    handler: (appState?: AppState, ...args: any[]) => void
  ) => EventEmitter;
  emit?: (eventName: string, ...args: any[]) => boolean;
  expandEditor: () => void;
}

export interface ToolBarState {
  toolbarItems: {
    inlineStyles: InlineStyle[];
    blockTypes: BlockType[];
  };
}

export default class ToolBar extends React.Component<ToolBarProps> {
  state: ToolBarState;

  //Default ToolBar Icon Style
  static defaultIconStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  };

  static defaultProps = {
    allowEditorExpand: true
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
    // Check the state of the current enabled property to let the toolbar know if the
    // current btn is active or not Switch View (Draft/HTML)
    this.props.setAppStateClb(prevState => ({
      showDraftHTML: !prevState.showDraftHTML
    }));
    //Is it Active
    return true;
  }

  render() {
    //TODO: Export This on a CONFIG object and allow it as a Creation API for users

    const { allowEditorExpand } = this.props;
    const { inlineStyles, blockTypes } = initToolbarItemsSync(
      this.props.appState,
      this.props.on,
      this.props.emit,
      this.updateEditorState.bind(this),
      this.toggleDraftHTMLView.bind(this)
    );

    return (
      <div className="toolbar">
        <Controls
          appState={this.props.appState}
          setAppState={this.props.setAppState}
          inlineStyles={inlineStyles}
          blockTypes={blockTypes}
          updateEditorState={this.updateEditorState.bind(this)}
          getUniqueElementKey={this.props.getUniqueElementKey}
          on={this.props.on}
          emit={this.props.emit}
        />{" "}
        {allowEditorExpand && (
          <span
            id="expand-editor-btn"
            className="expand-editor"
            onClick={this.props.expandEditor}
          >
            <Icon icon="expandArrow" size={13} />
          </span>
        )}
      </div>
    );
  }
}
