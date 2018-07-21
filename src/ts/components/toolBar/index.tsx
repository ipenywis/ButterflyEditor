import * as React from "react";

import {AppState} from "../../store";

import * as _ from "lodash";

//Toolbar Actions
import * as actions from "./actions";

//import * as actions from "./actions"; Icons
import {Icon} from 'react-icons-kit'
import {
  bold,
  italic,
  underline,
  alignCenter,
  alignLeft,
  alignRight,
  alignJustify
} from 'react-icons-kit/fa/';

import {ToolItem, defaultToolItems} from "./toolConfig";

import Controls, {InlineStyle, BlockType} from "./controls";
import {EditorState} from "draft-js";

export interface ToolBarProps {
  appState?: AppState;

  setAppState?: (newState : any, callback?: () => void) => void;
}

export interface ToolBarState {}

export default class ToolBar extends React.Component < ToolBarProps > {

  state : ToolBarState;

  //Default ToolBar Icon Style
  static defaultIconStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  }

  constructor(props : ToolBarProps) {
    super(props);
    this.state = {};
  }

  updateEditorState(newEditorState : EditorState, callback?: () => void) {
    this
      .props
      .setAppState({
        editorState: newEditorState
      }, callback);
  }

  componentWillMount() {
    console.log("Updating...", this.state);
  }

  render() {

    let inlineStyles : InlineStyle[] = [
      {
        label: "Bold",
        style: "BOLD",
        groupID: 0,
        icon: <Icon icon={bold}/>
      }, {
        label: "Italic",
        style: "ITALIC",
        groupID: 0,
        icon: <Icon icon={italic}/>
      }, {
        label: "underline",
        style: "UNDERLINE",
        groupID: 0,
        icon: <Icon icon={underline}/>
      }, {
        label: "alignRight",
        style: "ALIGN_RIGHT",
        groupID: 1,
        icon: <Icon icon={alignRight}/>
      }
    ]

    let blockTypes : BlockType[] = [
      {
        label: "H1",
        type: "header-one",
        groupID: 0
      }, {
        label: "H2",
        type: "header-two",
        groupID: 0
      }, {
        label: "H3",
        type: "header-three",
        groupID: 0
      }, {
        label: "H4",
        type: "header-fourth",
        groupID: 0
      }, {
        label: "H5",
        type: "header-five",
        groupID: 0
      }, {
        label: "H6",
        type: "header-six",
        groupID: 0
      }
    ];

    return (
      <div className="toolbar">
        <Controls
          appState={this.props.appState}
          setAppState={this.props.setAppState}
          inlineStyles={inlineStyles}
          blockTypes={blockTypes}
          updateEditorState={this
          .updateEditorState
          .bind(this)}/>
      </div>
    );

  }

}

/**


<div className="t-group">
          <div
            className={"t-item " + (this.props.appState.editorState.getCurrentInlineStyle().has("BOLD")
            ? "toggle"
            : "")}
            onClick={(e) => this.toggleToolItem(e, "BOLD")}>
            <div className="t-icon"><Icon icon={bold} style={ToolBar.defaultIconStyle}/></div>
          </div>
          <div
            className={"t-item " + (_.includes(activeItems, "italic")
            ? "toggle"
            : "")}
            onClick={(e) => this.toggleToolItem(e, "italic")}>
            <div className="t-icon"><Icon icon={italic} style={ToolBar.defaultIconStyle}/></div>
          </div>
          <div
            className={"t-item " + (_.includes(activeItems, "underline")
            ? "toggle"
            : "")}
            onClick={(e) => this.toggleToolItem(e, "underline")}>
            <div className="t-icon"><Icon icon={underline} style={ToolBar.defaultIconStyle}/></div>
          </div>
        </div>
        <div className="t-group">
          <div
            className={"t-item " + (_.includes(activeItems, "alignLeft")
            ? "toggle"
            : "")}
            onClick={(e) => this.toggleToolItem(e, "alignLeft")}>
            <div className="t-icon"><Icon icon={alignLeft} style={ToolBar.defaultIconStyle}/></div>
          </div>
          <div
            className={"t-item " + (_.includes(activeItems, "alignCenter")
            ? "toggle"
            : "")}
            onClick={(e) => this.toggleToolItem(e, "alignCenter")}>
            <div className="t-icon"><Icon icon={alignCenter} style={ToolBar.defaultIconStyle}/></div>
          </div>
          <div
            className={"t-item " + (_.includes(activeItems, "alignRight")
            ? "toggle"
            : "")}
            onClick={(e) => this.toggleToolItem(e, "alignRight")}>
            <div className="t-icon"><Icon icon={alignRight} style={ToolBar.defaultIconStyle}/></div>
          </div>
          <div
            className={"t-item " + (_.includes(activeItems, "alignJustify")
            ? "toggle"
            : "")}
            onClick={(e) => this.toggleToolItem(e, "alignJustify")}>
            <div className="t-icon"><Icon icon={alignJustify} style={ToolBar.defaultIconStyle}/></div>
          </div>
        </div>



 */