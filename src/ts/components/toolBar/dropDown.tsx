import * as React from "react";

//Lodash
import * as _ from "lodash";

//Icon
import { Icon } from "react-icons-kit";
import { bold } from "react-icons-kit/fa/";
import { chevronDown } from "react-icons-kit/fa/chevronDown";

import { SafeWrapper } from "../common";

//Click Outside Container Handler
import OutsideClickHandler from "react-outside-click-handler";

//Create Styles
import createStyle from "./inlineStyle";
import { EditorState } from "draft-js";

export interface DropDownProps {
  className?: string;
  container?: string;
  outsideClickCanClose?: boolean;
  icon: typeof Icon | Object;
  editorState: EditorState; ///< Temp

  activeItems?: string[];

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
    outsideClickCanClose: true
  };

  dropDownBtn: HTMLButtonElement;

  constructor(props: DropDownProps) {
    super(props);
    this.state = {
      isOpen: false
    };
  }

  toggleDropDown(e: MouseEvent) {
    e.preventDefault(); ///< Prevent Default Behavior
    //Change the Current State (Regarding to the Previous One)
    this.setState((prevState: DropDownState) => ({
      isOpen: !prevState.isOpen
    }));
  }

  render() {
    //Container by default is select
    let renderContainer = "select";
    if (this.props.container) renderContainer = this.props.container;

    const iconFontSize = 13;

    //On Select Change (Only Select!)
    let onSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      e.preventDefault();
      this.props.onChange(e.currentTarget.value);
    };

    //No Children Please Dont even try to Render (Undefined || Null | Empty Strings) ex: [undefined, undefined ...]
    const childsArr = React.Children.toArray(this.props.children);
    if (
      _.isEqual(childsArr, Array(childsArr.length).fill(undefined)) ||
      _.isEqual(childsArr, Array(childsArr.length).fill(null)) ||
      _.isEqual(childsArr, Array(childsArr.length).fill(""))
    )
      return null;

    const { icon, activeItems } = this.props;

    //Check if item is active (use item label to check for the current item it's active)
    const isActive = (label: string) => {
      let active = false;
      //Use label as value to check for current style (for ex: fontSize: 53px)
      let matchRegx = new RegExp(`${label},?-?_?.?`);
      for (const item of activeItems) {
        console.warn("Match regex: ", matchRegx, item);
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
            className={this.props.className}
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
              className={"btn-dropdown " + this.props.className}
              style={{ width: "50px", justifyContent: "space-between" }}
              ref={btn => (this.dropDownBtn = btn)}
              onClick={this.toggleDropDown.bind(this)}
              onMouseDown={e => e.preventDefault()}
            >
              <span className="btn-icon">{icon}</span>
              {false && <span className="btn-text">DropDown</span>}
              <span style={{ marginTop: "2px" }}>
                <Icon icon={chevronDown} size={iconFontSize - 2} />
              </span>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {this.state.isOpen && (
                  <div className="btn-dropdown-container ip-scrollbar">
                    {React.Children.map(this.props.children, (child, idx) => {
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
                    })}
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
