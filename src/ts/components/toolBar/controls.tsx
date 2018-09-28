import * as React from "react";

import * as _ from "lodash";

import { AppState } from "../../store";

import { EditorState, RichUtils } from "draft-js";

//DropDown
import DropDown from "./dropDown";

//Popup
import Popup from "../popup";

//Icons
import { Icon } from "react-icons-kit";
import {
  bold,
  italic,
  underline,
  alignCenter,
  alignLeft,
  alignRight,
  alignJustify
} from "react-icons-kit/fa/";
import { ToolBarState } from ".";

import { SafeWrapper, insertBlock } from "../common";

//Create Inline Custom Styles
import createStyle, {
  customStyles,
  ICreateStyle,
  IStyle,
  getStringValue
} from "./inlineStyle";
import Editor from "../../editor";
import { EventEmitter } from "events";

//DropDown Item
export interface ToolbarDropDownItem {
  label?: string;
  icon?: typeof Icon | Object;
  type: string;
  onSelect?: (label?: string) => boolean;
  customStyles?: ICreateStyle["styles"];
}

//Toolbar DropDown
export interface ToolbarDropDown {
  items: ToolbarDropDownItem[];
}

//Toolbar Popup
export interface ToolbarPopup {
  isInline?: boolean;
  header?: string;
  container?: React.ReactElement<any>;
  footer?: React.ReactElement<any> | React.ReactElement<any>[];
  standAlone?: React.ReactElement<any>;
}

/* Item Types */
export interface ToolbarItem {
  label?: string;
  groupID?: number;
  dropDown?: ToolbarDropDown;
  onSelect?: (label?: string) => boolean;
  customStyles?: ICreateStyle["styles"];
  type?: string;
  popup?: ToolbarPopup;
}

//Single Inline Style
export interface InlineStyle extends ToolbarItem {
  icon?: typeof Icon | object;
}

//Block Item
export interface BlockType extends ToolbarItem {
  icon?: typeof Icon | object;
}

export interface ControlsProps {
  appState: AppState;
  inlineStyles: InlineStyle[];
  blockTypes: BlockType[];

  setAppState: (newState: any, callback?: () => void) => void;
  updateEditorState: (
    newEditorState: EditorState,
    callback?: () => void
  ) => void;

  //Events
  on?: (
    eventName: string,
    handler: (appState?: AppState, ...args: any[]) => void
  ) => EventEmitter;
  emit?: (eventName: string, ...args: any[]) => boolean;
}

//Group Wrapper of a toolbar items
const TGroupWrapper: React.SFC<any> = (props: any) => {
  //Toolbar Items Wrapper Group
  const children = React.Children.toArray(props.children);
  if (children.length > 0)
    return (
      <div className="t-group">
        {children.map(child => {
          if (child) return child;
        })}
      </div>
    );
  return null;
};

export default class Controls extends React.Component<ControlsProps> {
  static defaultProps = {
    groupID: 0
  };

  constructor(props: ControlsProps) {
    super(props);
    this.state = {};
  }

  toggleStyle(style: string) {
    this.props.updateEditorState(
      RichUtils.toggleInlineStyle(this.props.appState.editorState, style)
    );
  }

  toggleBlock(type: string) {
    const newEditorState = insertBlock(
      RichUtils.toggleBlockType(this.props.appState.editorState, type)
    );

    this.props.updateEditorState(newEditorState);
  }

  updateEditorState(newEditorState: EditorState) {
    this.props.setAppState({ editorState: newEditorState });
  }

  render() {
    /* Inline Style Groups */
    //Find out the Number of groups of the toolbar items
    let styleItemGroups: number[] = [];
    this.props.inlineStyles.map((item, idx) => {
      // Array has all the other items but the one we are comaparing! let subArray =
      // this.props.toolbarItems.splice(idx, 1);
      if (!_.includes(styleItemGroups, item.groupID)) {
        //Only Add it to the Already In list if not already
        styleItemGroups.push(item.groupID);
      }
    });

    /* Block Types Groups */
    let blockItemGroups: number[] = [];
    this.props.blockTypes.map((item, idx) => {
      if (!_.includes(blockItemGroups, item.groupID)) {
        blockItemGroups.push(item.groupID);
      }
    });

    //Current Selected Style
    let currentStyle = this.props.appState.editorState.getCurrentInlineStyle();

    //Current Selected Block Type
    const selection = this.props.appState.editorState.getSelection(); ///< Current Selected Text (Cursor)
    const currentBlockType = this.props.appState.editorState
      .getCurrentContent()
      .getBlockForKey(selection.getStartKey())
      .getType();

    return (
      <div className="flex-container-horz">
        <RenderInlineStyles
          inlineStyles={this.props.inlineStyles}
          itemGroups={styleItemGroups}
          currentStyle={currentStyle}
          toggleStyle={this.toggleStyle.bind(this)}
          appState={this.props.appState}
          updateEditorState={this.updateEditorState.bind(this)}
          setAppState={this.props.setAppState}
          on={this.props.on}
          emit={this.props.emit}
        />

        <RenderBlockTypes
          blockTypes={this.props.blockTypes}
          itemGroups={blockItemGroups}
          currentBlockType={currentBlockType}
          toggleBlock={this.toggleBlock.bind(this)}
          inDropDown={false}
          appState={this.props.appState}
        />
      </div>
    );
  }
}

//Inline Styles Renderer
interface InlineStylesProps {
  inlineStyles: InlineStyle[];
  itemGroups: number[];
  currentStyle: any; ///< Editor Current Style uses (Ordered Set)!
  appState: AppState;

  setAppState: (newState: any, callback?: () => void) => void;
  toggleStyle: (style: string) => void;
  updateEditorState: (newEditorState: EditorState) => void;

  //Events
  on?: (
    eventName: string,
    handler: (appState?: AppState, ...args: any[]) => void
  ) => EventEmitter;
  emit?: (eventName: string, ...args: any[]) => boolean;
}

let RenderInlineStyles: React.SFC<InlineStylesProps> = (
  props: InlineStylesProps
) => {
  //Extract Props
  let {
    itemGroups,
    currentStyle,
    inlineStyles,
    toggleStyle,
    updateEditorState,
    setAppState,
    appState,
    on,
    emit
  } = props;
  let { editorState } = appState;

  //Toggle Active State of an item (button, dropDown or popup)
  const toggleActive = (label: string) => {
    //Check if it already exists in the current active items array
    if (_.includes(appState.activeItems, label)) {
      //Remove it  (not active anymore)
      console.warn("LABEL: ", label, "Before removing: ", appState.activeItems);
      let newActiveItems = _.without(appState.activeItems, label);
      console.warn("After removing: ", newActiveItems);
      setAppState({ activeItems: newActiveItems });
    } else {
      //Not Included then Add it (make it active)
      let newActiveItems = [...appState.activeItems, label];
      setAppState({ activeItems: newActiveItems });
    }
  };

  //Convert Label to a Style Type
  let getTypeFromLabel = (label: string): string => {
    let type = null;
    //Loop on All Items
    inlineStyles.map(item => {
      //If the item is a DropDown then Go Deep by finding it's items and check label
      if (item.dropDown) {
        item.dropDown.items.map(it => {
          if (it.label == label) type = it.type;
        });
      } else {
        //Otherwise, a normal item then just check and return type
        if (item.label == label) type = item.type;
      }
    });
    //Return FINAL RESULT
    return type;
  };

  //keep track of the return type if the button is using a custom onSelect function (func has to return a boolean)
  let onSelectActive: boolean = false;
  //Apply Button Toggle
  const onButtonToggle = (styleLabel: string, customStyle?: string) => {
    toggleActive(styleLabel);
    //Find Item by Label
    let item: ToolbarItem;
    inlineStyles.map(it => {
      if (it.label == styleLabel) item = it;
    });
    //Check if DropDown Item does have a Custom Style to be Applied or a onSelect Method to Run otherwise just run a default style application
    /** Application Order (Which to be applied First)
     * OnSelect
     * customStyle
     * type
     */
    if (item.onSelect) {
      //Call OnSelect func passing it current item label
      onSelectActive = item.onSelect(item.label);
    } else if (item.customStyles) {
      //Get Final State by Looping and Applying all item styles using (Reduce) to apply new changes to prev applied editor state
      let newEditorState: EditorState = Object.keys(item.customStyles).reduce(
        (prevEditorState, style) => {
          return (createStyle.styles[style] as IStyle).toggle(
            prevEditorState,
            item.customStyles[style] as string
          );
        },
        editorState
      );
      //Update With the Final Editor State
      props.updateEditorState(newEditorState);
    } else {
      //Get Default Registered Style Using label
      let style = getTypeFromLabel(item.label);
      //Toggle it
      toggleStyle(style);
    }
  };

  //Apply DropDown Change
  const onDropDownChange = (styleLabel: string, customStyle?: string) => {
    toggleActive(styleLabel);
    //Find DropDown Item by Label
    let dropDownItem: ToolbarDropDownItem;
    inlineStyles.map(it => {
      //Does it have a DropDown
      if (it.dropDown) {
        it.dropDown.items.map(drit => {
          if (drit.label == styleLabel) return (dropDownItem = drit);
        });
      }
    });
    //Check if DropDown Item does have a Custom Style to be Applied or a onSelect Method to Run otherwise just run a default style application
    /** Application Order (Which to be applied First)
     * OnSelect
     * customStyle
     * type
     */
    if (dropDownItem.onSelect) {
      //Run the OnSelect Method passing it the Current Label
      onSelectActive = dropDownItem.onSelect(dropDownItem.label);
    } else if (dropDownItem.customStyles) {
      //Apply the Custom Style using the draft-js-custom-styles module (Linked Via a StyleMap or a StyleFunction)
      //Toggle All Styles and Get Next Editor State to Apply using Reduce
      let newEditorState: EditorState = Object.keys(
        dropDownItem.customStyles
      ).reduce((prevEditorState, style) => {
        //Toggle and Return New Editor State till the Last Element (So all elements gets applied over one editorState all changes will be saved)
        return (createStyle.styles[style] as IStyle).toggle(
          prevEditorState,
          dropDownItem.customStyles[style] as string
        );
      }, editorState);
      //Update Editor State
      updateEditorState(newEditorState);
    } else {
      //Is it in dropDown
      let style = getTypeFromLabel(styleLabel);
      //Apply Style (Toggle It)
      toggleStyle(style);
    }
  };

  //Target Render Container
  const container = "button";

  //Check if Currently Selected Text is active (have the style of any toggeled styles)
  const isActive = (item: ToolbarItem): boolean => {
    console.warn("Current Style: ", currentStyle);
    if (item.onSelect) {
      //TODO: Implement onSelect
      return _.includes(appState.activeItems, item.label);
    } else if (item.customStyles) {
      //All Custom Styles need to be checked
      let active = true;
      //Loop & check on all string prop value pairs and see if they exist on the current style if using a custom CSS styles
      getStringValue(item.customStyles).map(val => {
        console.warn("value: ", val, new RegExp(`${val}$`).exec(val));
        if (!currentStyle.has(val)) active = false;
      });
      return active;
    } else {
      //Use the Type to check for currently toggeled style
      return currentStyle.has(item.type);
    }
  };
  //Make currently active items ready for DropDown
  const dropDownActiveStyles = [...currentStyle.values()];
  console.warn("Cureent style: ", dropDownActiveStyles);

  return (
    <SafeWrapper>
      {itemGroups.map((groupID, gidx) => {
        return (
          <SafeWrapper>
            {inlineStyles.map((item, idx) => {
              if (item.groupID == groupID && !item.popup && item.dropDown)
                return (
                  <DropDown
                    className="t-dropDown"
                    onChange={val => onDropDownChange(val)}
                    container={container}
                    icon={item.icon}
                    editorState={props.appState.editorState}
                    activeItems={dropDownActiveStyles}
                  >
                    {item.groupID == groupID &&
                      item.dropDown.items.map((dropItem, dIdx) => {
                        if (dropItem.icon)
                          return (
                            <SafeWrapper>
                              {dropItem.icon} <span>{dropItem.label}</span>
                            </SafeWrapper>
                          );
                        else return dropItem.label;
                      })}
                  </DropDown>
                );
              else return null;
            })}

            {
              <TGroupWrapper>
                {inlineStyles.map((item, idx) => {
                  if (
                    item.groupID == groupID &&
                    item.popup &&
                    !item.dropDown &&
                    !item.popup.standAlone
                  )
                    return (
                      <Popup
                        isInline={item.popup.isInline}
                        label={item.label}
                        icon={item.icon}
                        header={item.popup.header}
                        container={item.popup.container}
                        footer={item.popup.footer}
                        updateEditorState={props.updateEditorState}
                        editorState={props.appState.editorState}
                        editor={props.appState.editor}
                        on={on}
                        emit={emit}
                      />
                    );
                  else if (
                    item.groupID == groupID &&
                    item.popup &&
                    !item.dropDown &&
                    item.popup.standAlone
                  ) {
                    return item.popup.standAlone;
                  } else return null;
                })}
              </TGroupWrapper>
            }
            <TGroupWrapper>
              {inlineStyles.map((item, idx) => {
                if (item.groupID == groupID && !item.dropDown && !item.popup) {
                  return (
                    <div
                      className={"t-item " + (isActive(item) ? "toggle" : "")}
                      key={item.label}
                      onMouseDown={e => {
                        e.preventDefault();
                        onButtonToggle(item.label);
                      }}
                    >
                      <div className="t-icon">{item.icon}</div>
                    </div>
                  );
                } else return null;
              })}
            </TGroupWrapper>
          </SafeWrapper>
        );
      })}
    </SafeWrapper>
  );
};

/*


 <SafeWrapper>
      {itemGroups.map((groupID, gidx) => {
        return (
          <SafeWrapper>
            {inlineStyles.map((item, idx) => {
              if (item.groupID == groupID && !item.popup && item.dropDown)
                return (
                  <DropDown
                    className="t-dropDown"
                    onChange={val => onDropDownChange(val)}
                    container={container}
                    icon={item.icon}
                    editorState={props.appState.editorState}
                  >
                    {item.groupID == groupID &&
                      item.dropDown.items.map((dropItem, dIdx) => {
                        if (dropItem.icon)
                          return (
                            <SafeWrapper>
                              {dropItem.icon} <span>{dropItem.label}</span>
                            </SafeWrapper>
                          );
                        else return dropItem.label;
                      })}
                  </DropDown>
                );
              else return null;
            })}
            <TGroupWrapper>
              {inlineStyles.map((item, idx) => {
                if (
                  item.groupID == groupID &&
                  item.popup &&
                  !item.dropDown &&
                  !item.popup.standAlone
                )
                  return (
                    <Popup
                      isInline={item.popup.isInline}
                      label={item.label}
                      icon={item.icon}
                      header={item.popup.header}
                      container={item.popup.container}
                      footer={item.popup.footer}
                      updateEditorState={props.updateEditorState}
                      editorState={props.appState.editorState}
                      editor={props.appState.editor}
                      on={on}
                      emit={emit}
                    />
                  );
                else if (
                  item.groupID == groupID &&
                  item.popup &&
                  !item.dropDown &&
                  item.popup.standAlone
                ) {
                  return item.popup.standAlone;
                } else return null;
              })}
            </TGroupWrapper>
            <TGroupWrapper>
              {inlineStyles.map((item, idx) => {
                if (item.groupID == groupID && !item.dropDown && !item.popup) {
                  return (
                    <div
                      className={"t-item " + (isActive(item) ? "toggle" : "")}
                      key={item.label}
                      onMouseDown={e => {
                        e.preventDefault();
                        onButtonToggle(item.label);
                      }}
                    >
                      <div className="t-icon">{item.icon}</div>
                    </div>
                  );
                } else return null;
              })}
            </TGroupWrapper>
          </SafeWrapper>
        );
      })}
    </SafeWrapper>



*/

//Block Styles
interface BlockTypesProps {
  blockTypes: BlockType[];
  currentBlockType: string;
  itemGroups: number[];
  inDropDown?: boolean;
  appState: AppState;

  toggleBlock: (type: string) => void;
}

//Block Types Renderer
let RenderBlockTypes: React.SFC<BlockTypesProps> = (props: BlockTypesProps) => {
  let {
    blockTypes,
    currentBlockType,
    itemGroups,
    inDropDown,
    toggleBlock
  } = props;

  //Target Render Container
  const container = "button";

  //Convert Label to a block type
  //Convert Label to a Style Type
  let getTypeFromLabel = (label: string): string => {
    let type = null;
    //Loop on All Items
    blockTypes.map(item => {
      //If the item is a DropDown then Go Deep by finding it's items and check label
      if (item.dropDown) {
        item.dropDown.items.map(it => {
          if (it.label == label) type = it.type;
        });
      } else {
        //Otherwise, a normal item then just check and return type
        if (item.label == label) type = item.type;
      }
    });
    //Return FINAL RESULT
    return type;
  };

  let onDropDownChange = (blockLabel: string) => {
    //Get Current Type (ex: H3 => header-there)
    let blockType = getTypeFromLabel(blockLabel);
    //; ///< Logging
    toggleBlock(blockType);
  };

  return (
    <div
      style={{
        display: "flex"
      }}
    >
      {itemGroups.map((groupID, gidx) => {
        return (
          <SafeWrapper>
            {blockTypes.map((item, idx) => {
              if (item.dropDown)
                return (
                  <DropDown
                    className="t-dropDown"
                    onChange={onDropDownChange}
                    container={container}
                    icon={item.icon}
                    editorState={props.appState.editorState}
                  >
                    {item.groupID == groupID &&
                      item.dropDown.items.map((dropItem, dIdx) => {
                        if (dropItem.icon)
                          return (
                            <SafeWrapper key={dIdx}>
                              {dropItem.icon} <span>{dropItem.label}</span>
                            </SafeWrapper>
                          );
                        else return dropItem.label;
                      })}
                  </DropDown>
                );
            })}

            <div className="t-group" key={gidx}>
              {blockTypes.map((item, idx) => {
                if (item.groupID == groupID && !item.dropDown) {
                  return (
                    <div
                      className={
                        "t-item " +
                        (currentBlockType == item.type ? "toggle" : "")
                      }
                      key={item.label}
                      onMouseDown={e => {
                        e.preventDefault();
                        toggleBlock(item.type);
                      }}
                    >
                      <div className="t-icon">{item.icon}</div>
                    </div>
                  );
                }
              })}
            </div>
          </SafeWrapper>
        );
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

//WAN PASS: 03121947 WAN USER: 036637038