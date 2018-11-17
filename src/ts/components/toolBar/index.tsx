import * as React from "react";

import { AppState } from "../../store";

import * as _ from "lodash";

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
import ColorPicker from "../../plugins/colorPicker";
//Link Plugin
import Link from "../../plugins/link";
//Anchor Plugin
import Anchor from "../../plugins/anchor";
//Code Editor Plugin
import CodeEditor from "../../plugins/codeEditor";

import createStyle, { ICreateStyle, IStyle, customStyles } from "./inlineStyle";
import { EventEmitter } from "events";

//Rich Utils [EXTENDED] (Custom Version)
import RichUtils from "./richUtils";
import ImageUploader from "../../plugins/imageUploader";

//Toolbar Item standard Labels enum
import { EDITOR_TOOLBAR_LABELS } from "./common";

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
    //TODO: Export This on a CONFIG object and allow it as a Creation API for users
    let inlineStyles: InlineStyle[] = [
      {
        label: "Bold",
        type: "BOLD",
        groupID: 0,
        icon: <Icon icon={bold} />
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
        label: "strike through",
        type: "STRIKE-THROUGH",
        groupID: 0,
        icon: <Icon icon={bold} />
      },
      {
        label: "Font Familly",
        groupID: 1,
        icon: <Icon icon={font} />,
        dropDown: {
          items: fontFamiliesStyle
        }
      },
      {
        label: "Font Size",
        groupID: 1,
        icon: <Icon icon={textHeight} />,
        dropDown: {
          items: fontSizesStyle
        }
      },
      {
        groupID: 2,
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
        }
      },
      {
        label: EDITOR_TOOLBAR_LABELS.HTML,
        groupID: 3,
        icon: <Icon icon={code} />,
        onSelect: this.toggleDraftView.bind(this)
      },
      {
        groupID: 3,
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
        groupID: 3,
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
        groupID: 3,
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

    let blockTypes: BlockType[] = [
      {
        groupID: 0,
        popup: {
          standAlone: (
            <ImageUploader
              updateEditorState={this.updateEditorState.bind(this)}
              editorState={this.props.appState.editorState}
              editor={this.props.appState.editor}
              on={this.props.on}
              emit={this.props.emit}
              onFileUpload={file => {
                return new Promise((rs, rj) => {
                  //TEMP only for testing it works as a server uploading Technique (Just For Visualazation)
                  setTimeout(
                    () => rj(`File Uploaded ${file.name} Successfully`),
                    2000
                  );
                });
              }}
            />
          )
        }
      },
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
      }
      /*{
        label: "Code Block",
        type: "code-block",
        groupID: 1,
        icon: <Icon icon={square} />
      }
      NOTE: Code block is displayed because we have the Code Editor Plugin to rely on (more advanced) (using both may cause some unexpected bugs)
      */
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
        <span
          id="expand-editor-btn"
          className="expand-editor"
          onClick={this.props.expandEditor}
        >
          <Icon icon={expand} size={15} />
        </span>
      </div>
    );
  }
}
