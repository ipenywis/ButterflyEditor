import * as React from "react";

//Lodash
import { isEqual, includes } from "lodash";

//Icon
import Icon, { IIconRotate } from "../toolBar/icon";

import { SafeWrapper } from "../common";

//Click Outside Container Handler
import OutsideClickHandler from "react-outside-click-handler";

//Create Styles
import { EditorState } from "draft-js";

export interface DropDownProps {
  className?: string;
  container?: string;
  outsideClickCanClose?: boolean;
  icon: typeof Icon | Object;
  editorState: EditorState; ///< Temp

  activeItems?: string[];
  disabledItems?: string[];

  //is DropDown Disabled
  isDisabled?: boolean;

  isItemActive?: (label: string) => boolean;
  onChange?: (blockLabel: string) => void;
  //onSelect?: (e : React.MouseEvent < any >, selected : string) => void;
}

interface DropDownState {
  isOpen: boolean;
}

export default class DropDown extends React.Component<DropDownProps> {
  state: DropDownState;
  public static defaultProps = {
    container: "select",
    outsideClickCanClose: true,
    isDisabled: false
  };

  dropDownBtn: HTMLButtonElement;

  constructor(props: DropDownProps) {
    super(props);
    this.state = {
      isOpen: false
    };
  }

  toggleDropDown(e: MouseEvent) {
    const { isDisabled } = this.props;
    e.preventDefault(); ///< Prevent Default Behavior
    //Change the Current State (Regarding to the Previous One)
    this.setState((prevState: DropDownState) => ({
      isOpen: !prevState.isOpen && !isDisabled
    }));
  }

  render() {
    const { isDisabled } = this.props;

    //Container by default is select
    let renderContainer = "select";
    if (this.props.container) renderContainer = this.props.container;

    const iconFontSize = 13;

    //On Select Change (Only Select!)
    let onSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      e.preventDefault();
      this.props.onChange(e.currentTarget.value);
    };

    // No Children Please Dont even try to Render (Undefined || Null | Empty Strings)
    // ex: [undefined, undefined ...]
    const childsArr = React.Children.toArray(this.props.children);
    if (
      isEqual(childsArr, Array(childsArr.length).fill(undefined)) ||
      isEqual(childsArr, Array(childsArr.length).fill(null)) ||
      isEqual(childsArr, Array(childsArr.length).fill(""))
    )
      return null;

    const { icon, activeItems, disabledItems } = this.props;

    // Check if item is active (use item label to check for the current item it's
    // active)
    const isActive = (label: string, alias?: string) => {
      // If defined use provided callback for deciding weather the current item is
      // active or not
      if (this.props.isItemActive) return this.props.isItemActive(label);

      // Using alise when label doesn't match the currently active block's type for ex:
      // H5 != header-five
      if (alias) return includes(activeItems, alias);
      let active = false;
      //Use label as value to check for current style (for ex: fontSize: 53px)
      let matchRegx = new RegExp(`${label},?-?_?.?`);
      for (const item of activeItems) {
        if (matchRegx.test(item)) {
          active = true;
          break;
        }
      }
      return active;
    };

    return (
      <SafeWrapper>
        {/*SELECT*/}
        {renderContainer == "select" && (
          <select
            className={this.props.className + (isDisabled ? " disabled" : "")}
            defaultValue="Header"
            onChange={onSelectChange}
          >
            {React.Children.map(this.props.children, (child, idx) => {
              if (child)
                return (
                  <option
                    className="dropDown-item"
                    key={idx}
                    onMouseDown={e => e.preventDefault()}
                  >
                    {child}
                  </option>
                );
            })}
          </select>
        )}
        {/*BUTTON*/}
        {renderContainer == "button" && (
          <OutsideClickHandler
            onOutsideClick={() =>
              this.props.outsideClickCanClose
                ? this.setState({ isOpen: false })
                : null
            }
          >
            <button
              className={
                "btn-dropDown " +
                this.props.className +
                (isDisabled ? " disabled" : "")
              }
              style={{
                width: "50px",
                justifyContent: "space-between"
              }}
              ref={btn => (this.dropDownBtn = btn)}
              onClick={this.toggleDropDown.bind(this)}
              onMouseDown={e => e.preventDefault()}
            >
              <span className="btn-icon">{icon}</span>
              {false && <span className="btn-text">DropDown</span>}
              <span
                style={{
                  marginTop: "2px"
                }}
              >
                <Icon
                  icon={"minimalArrow"}
                  size={iconFontSize - 2}
                  rotation={IIconRotate.TOP}
                />
              </span>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column"
                }}
              >
                {this.state.isOpen && (
                  <div className="btn-dropDown-container ip-scrollbar">
                    {React.Children.map(
                      this.props.children,
                      (child: any, idx) => {
                        if (child)
                          return (
                            <div
                              className={
                                "dropDown-item " +
                                (isActive(child.toString()) ? "toggle" : "")
                              }
                              key={idx}
                              onMouseDown={e => {
                                e.preventDefault();
                                this.props.onChange(child.toString());
                              }}
                            >
                              {child}
                            </div>
                          );
                      }
                    )}
                  </div>
                )}
              </div>
            </button>
          </OutsideClickHandler>
        )}
      </SafeWrapper>
    );
  }
}
