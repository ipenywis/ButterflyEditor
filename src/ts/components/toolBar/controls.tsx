import * as React from "react";

import * as _ from "lodash";

import {AppState} from "../../store";

import {EditorState, RichUtils} from "draft-js";

//DropDown
import DropDown from "./dropDown";

//Icons
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
import {ToolBarState} from ".";
import {OrderedSet} from "../../../../node_modules/immutable";

/* Item Types */
export interface ToolbarItem {
  label : string;
  groupID?: number;
}

//Single Inline Style
export interface InlineStyle extends ToolbarItem {
  style : string;
  icon : typeof Icon | object;
}

//Block Item
export interface BlockType extends ToolbarItem {
  type : string;
  icon?: typeof Icon | object;
}

export interface ControlsProps {
  appState : AppState;
  inlineStyles : InlineStyle[];
  blockTypes : BlockType[];

  setAppState : (newState : any, callback?: () => void) => void;
  updateEditorState : (newEditorState : EditorState, callback?: () => void) => void;
}

export default class Controls extends React.Component < ControlsProps > {

  static defaultProps = {
    groupID: 0
  }

  constructor(props : ControlsProps) {
    super(props);
    this.state = {}
  }

  toggleStyle(style : string) {
    this
      .props
      .updateEditorState(RichUtils.toggleInlineStyle(this.props.appState.editorState, style));
  }

  toggleBlock(type : string) {
    this
      .props
      .updateEditorState(RichUtils.toggleBlockType(this.props.appState.editorState, type));
  }

  render() {
    /* Inline Style Groups */
    //Find out the Number of groups of the toolbar items
    let styleItemGroups : number[] = [];
    this
      .props
      .inlineStyles
      .map((item, idx) => {
        // Array has all the other items but the one we are comaparing! let subArray =
        // this.props.toolbarItems.splice(idx, 1);
        if (!_.includes(styleItemGroups, item.groupID)) {
          //Only Add it to the Already In list if not already
          styleItemGroups.push(item.groupID);
        }
      });

    /* Block Types Groups */
    let blockItemGroups : number[] = [];
    this
      .props
      .blockTypes
      .map((item, idx) => {
        if (!_.includes(blockItemGroups, item.groupID)) {
          blockItemGroups.push(item.groupID);
        }
      });

    //Current Selected Style
    let currentStyle = this
      .props
      .appState
      .editorState
      .getCurrentInlineStyle();

    //Current Selected Block Type
    const selection = this
      .props
      .appState
      .editorState
      .getSelection(); ///< Current Selected Text (Cursor)
    const currentBlockType = this
      .props
      .appState
      .editorState
      .getCurrentContent()
      .getBlockForKey(selection.getStartKey());

    return (
      <div className="flex-container-horz">
        <RenderInlineStyles
          inlineStyles={this.props.inlineStyles}
          itemGroups={styleItemGroups}
          currentStyle={currentStyle}
          toggleStyle={this
          .toggleStyle
          .bind(this)}/>

        <RenderBlockTypes
          blockTypes={this.props.blockTypes}
          itemGroups={blockItemGroups}
          currentBlockType={currentBlockType}
          toggleBlock={this
          .toggleBlock
          .bind(this)}/>
      </div>
    );
  }

}

//Inline Styles Renderer
interface InlineStylesProps {
  inlineStyles : InlineStyle[];
  itemGroups : number[];
  currentStyle : OrderedSet < string > ///< Editor Current Style uses (Ordered Set)!

  toggleStyle : (style : string) => void;
}

let RenderInlineStyles : React.SFC < InlineStylesProps > = (props : InlineStylesProps) => {
  let {itemGroups, currentStyle, inlineStyles, toggleStyle} = props;

  return (
    <div style={{
      display: "flex"
    }}>
      {itemGroups.map((groupID, gidx) => {
        return (
          <div className="t-group" key={gidx}>
            {inlineStyles.map((item, idx) => {
              if (item.groupID == groupID) {
                return <div
                  className={"t-item " + (currentStyle.has((item).style)
                  ? "toggle"
                  : "")}
                  key={item.label}
                  onClick={() => toggleStyle((item).style)}>
                  <div className="t-icon">{(item).icon}</div>
                </div>
              }
            })}
          </div>
        )
      })}
    </div>
  );
};

interface BlockTypesProps {
  blockTypes : BlockType[];
  currentBlockType : any; /// Doesn't Really MATTER!
  itemGroups : number[];
  inDropDown?: boolean;
  toggleBlock : (type : string) => void;
}

//Block Types Renderer
let RenderBlockTypes : React.SFC < BlockTypesProps > = (props : BlockTypesProps) => {

  let {blockTypes, currentBlockType, itemGroups, inDropDown, toggleBlock} = props;

  console.log(inDropDown);

  //Convert Label to a block type
  let getTypeFromLabel = (label : string) : string => {
    return _
      .find(blockTypes, ["label", label])
      .type;
  };

  let onDropDownChange = (e : MouseEvent) => {
    let blockLabel = (e.target as HTMLSelectElement).value;
    let blockType = getTypeFromLabel(blockLabel);
    console.log(blockType);
    toggleBlock(blockType);
  };

  return (
    <div style={{
      display: "flex"
    }}>
      {itemGroups.map((groupID, gidx) => {
        if (inDropDown) 
          return <DropDown className="t-dropDown" onChange={onDropDownChange}>
            {blockTypes.map((item, idx) => {
              if (item.groupID == groupID) 
                return item.label;
              }
            )}
          </DropDown>
        if (!inDropDown) 
          return <div className="t-group" key={gidx}></div>
      })}
    </div>
  );
};

/*

          return <div className="t-dropDown" key={gidx}>
            {blockTypes.map((item, idx) => {
              if (item.groupID == groupID)
                return <div className="t-dropDown-item" key={item.label}>{item.icon
                    ? item.icon
                    : item.label}</div>
            })}
          </div>

*/

//Default Props
RenderBlockTypes.defaultProps = {
  inDropDown: true
};