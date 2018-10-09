import * as React from "react";

import { AppState } from "../../store";

import * as _ from "lodash";

//Toolbar Actions
import * as actions from "./actions";

//import * as actions from "./actions"; Icons
import { Icon, IconProps } from "react-icons-kit";
import {
  bold,
  italic,
  underline,
  alignCenter,
  alignLeft,
  alignRight,
  alignJustify,
  quoteLeft,
  listUl,
  listOl,
  square,
  font,
  textHeight,
  paragraph,
  code,
  expand
} from "react-icons-kit/fa/";

import { ToolItem, defaultToolItems } from "./toolConfig";

import Controls, { InlineStyle, BlockType } from "./controls";
import { EditorState, Editor, ContentState } from "draft-js";

//Custom Styles
import { fontSizesStyle, fontFamiliesStyle } from "../customStyles";

//Color Picker Plugin
import ColorPicker from "../../plugins/colorPicker/colorPicker";
//Link Plugin
import Link from "../../plugins/link";
//Anchor Plugin
import Anchor from "../../plugins/anchor";
//Code Editor Plugin
import CodeEditor from "../../plugins/codeEditor";

import createStyle, { ICreateStyle, IStyle, customStyles } from "./inlineStyle";
import { EventEmitter } from "events";

//Rich Utils [EXTENDED]
import RichUtils from "./richUtils";

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

export interface ToolBarState {}

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
    this.state = {};
  }

  updateEditorState(newEditorState: EditorState, callback?: () => void) {
    this.props.setAppState(
      {
        editorState: newEditorState
      },
      callback
    );
  }

  toggleDraftView(e?: React.MouseEvent): boolean {
    //Check the state of the current enabled property to let the toolbar know if the current btn is active or not
    let isActive = !this.props.appState.showDraftHTML;
    //Switch View (Draft/HTML)
    this.props.setAppStateClb(prevState => ({
      showDraftHTML: !prevState.showDraftHTML
    }));
    //Is it Active
    return true;
  }

  componentWillMount() {}

  render() {
    let inlineStyles: InlineStyle[] = [
      {
        label: "Bold",
        type: "BOLD",
        groupID: 0,
        icon: <Icon icon={bold} />
        /*customStyles: {
          fontSize: "25px",
          fontFamily: "Oxygen, sans-serif",
          background: "red"
        }*/
      },
      {
        label: "Italic",
        type: "ITALIC",
        groupID: 0,
        icon: <Icon icon={italic} />
      },
      {
        label: "underline",
        type: "UNDERLINE",
        groupID: 0,
        icon: <Icon icon={underline} />
      },
      {
        label: "alignRight",
        type: "ALIGN_RIGHT",
        groupID: 0,
        icon: <Icon icon={alignRight} />
      },
      {
        label: "Font Familly",
        groupID: 2,
        icon: <Icon icon={font} />,
        dropDown: {
          items: fontFamiliesStyle
        }
      },
      {
        label: "Font Size",
        groupID: 4,
        icon: <Icon icon={textHeight} />,
        dropDown: {
          items: fontSizesStyle
        }
      },
      {
        label: "HTML",
        groupID: 5,
        icon: <Icon icon={code} />,
        onSelect: this.toggleDraftView.bind(this)
      },
      {
        label: "nothing",
        groupID: 5,
        icon: <Icon icon={alignCenter} />,
        customStyles: {
          fontSize: "30px"
        }
      },
      {
        groupID: 3,
        popup: {
          standAlone: (
            <ColorPicker
              updateEditorState={this.updateEditorState.bind(this)}
              editorState={this.props.appState.editorState}
              editor={this.props.appState.editor}
              on={this.props.on}
              emit={this.props.emit}
            />
          )
          /* header: "Hello There",
          container: <div>Container right over here</div>,
          isInline: false*/
        }
      },
      {
        groupID: 6,
        icon: <Icon icon={alignLeft} />,
        dropDown: {
          items: [
            {
              label: "center",
              type: "center",
              onSelect: () => {
                console.warn(RichUtils);
                /*RichUtils.applyStyleToBlock(this.props.appState.editorState, {
                  textAlign: "center",
                  color: "red"
                });*/
                /*const selection = this.props.appState.editorState.getSelection(); ///< Current Selected Text (Cursor)
                const currentBlockKey = this.props.appState.editorState
                  .getCurrentContent()
                  .getBlockForKey(selection.getStartKey())
                  .get("key");
                //const matchRegx = /\w+-?\d+?-?\d+?/;
                const currentBlock = document.querySelector(
                  `[data-offset-key^='${currentBlockKey}']`
                ) as HTMLDivElement;
                //Apply Alignment
                currentBlock.style.textAlign = "center";*/
                return false;
              }
            },
            {
              label: "right",
              type: "center"
            },
            {
              label: "left",
              type: "center"
            }
          ]
        }
      },
      {
        groupID: 3,
        icon: <Icon icon={underline} />,
        dropDown: {
          items: [
            {
              label: "Shit Happens",
              type: "nothing",
              onSelect: () => {
                let origSelection = this.props.appState.editorState.getSelection();
                let newEditorState = EditorState.acceptSelection(
                  this.props.appState.editorState,
                  origSelection
                );
                //Focus after 50ms
                this.props.appState.editor.focus();

                /*newEditorState = EditorState.acceptSelection(
                  newEditorState,
                  origSelection
                );*/

                newEditorState = EditorState.forceSelection(
                  newEditorState,
                  origSelection
                );

                newEditorState = (createStyle.styles.display as IStyle).toggle(
                  newEditorState,
                  "flex"
                );
                newEditorState = (createStyle.styles
                  .justifyContent as IStyle).toggle(newEditorState, "flex-end");

                this.updateEditorState(newEditorState);
                //window.setTimeout(() => this.props.appState.editor.focus(), 50);
                return false;
              }
            }
          ]
        }
      },
      {
        groupID: 5,
        popup: {
          standAlone: (
            <Link
              updateEditorState={this.updateEditorState.bind(this)}
              editorState={this.props.appState.editorState}
              editor={this.props.appState.editor}
              on={this.props.on}
              emit={this.props.emit}
            />
          )
        }
      },
      {
        groupID: 5,
        popup: {
          standAlone: (
            <Anchor
              updateEditorState={this.updateEditorState.bind(this)}
              editorState={this.props.appState.editorState}
              editor={this.props.appState.editor}
              on={this.props.on}
              emit={this.props.emit}
            />
          )
        }
      },
      {
        groupID: 5,
        popup: {
          standAlone: (
            <CodeEditor
              updateEditorState={this.updateEditorState.bind(this)}
              editorState={this.props.appState.editorState}
              editor={this.props.appState.editor}
              on={this.props.on}
              emit={this.props.emit}
            />
          )
        }
      }
    ];

    /**
     * Group ID 0 is for Dropdown
     * Other IDs are regular item groups
     */
    let blockTypes: BlockType[] = [
      {
        label: "Header",
        icon: <Icon icon={paragraph} />,
        groupID: 0,
        dropDown: {
          items: [
            {
              label: "H1",
              type: "header-one"
            },
            {
              label: "H2",
              type: "header-two"
            },
            {
              label: "H3",
              type: "header-three"
            },
            {
              label: "H4",
              type: "header-fourth"
            },
            {
              label: "H5",
              type: "header-five"
            },
            {
              label: "H6",
              type: "header-six"
            }
          ]
        }
      },
      {
        label: "Blockquote",
        type: "blockquote",
        groupID: 1,
        icon: <Icon icon={quoteLeft} />
      },
      {
        label: "UL",
        type: "unordered-list-item",
        groupID: 1,
        icon: <Icon icon={listUl} />
      },
      {
        label: "OL",
        type: "ordered-list-item",
        groupID: 1,
        icon: <Icon icon={listOl} />
      },
      {
        label: "Code Block",
        type: "code-block",
        groupID: 1,
        icon: <Icon icon={square} />
      }
    ];

    return (
      <div className="toolbar">
        <Controls
          appState={this.props.appState}
          setAppState={this.props.setAppState}
          inlineStyles={inlineStyles}
          blockTypes={blockTypes}
          updateEditorState={this.updateEditorState.bind(this)}
          on={this.props.on}
          emit={this.props.emit}
        />
        <span className="expand-editor" onClick={this.props.expandEditor}>
          <Icon icon={expand} size={15} />
        </span>
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
