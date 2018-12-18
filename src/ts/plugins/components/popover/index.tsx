import * as React from "react";
import * as ReactDOM from "react-dom";
import { SafeWrapper } from "../../../components/common";
import Button from "../button";
import ArrowTail, { ArrowDirection } from "../arrowTail";

import "./popover.scss";

import { Manager, Reference, Popper } from "react-popper";

interface PopoverProps {
  targetBtn: React.ReactElement<Button>;
  isOpen: boolean;
  popoverClassName?: string;
}

interface PopoverState {}

export default class Popover extends React.Component<
  PopoverProps,
  PopoverState
> {
  state: PopoverState;
  targetBtn: HTMLElement;

  //This Regex will Match translate3d(x, y, z) coordinates
  static translateCSSRegex = /\w+\((\d+)p?x?, ?(\d+)p?x?, ?(\d+)p?x?\)/;

  constructor(props: PopoverProps) {
    super(props);
    this.state = {};
  }

  render() {
    //TODO: Add more positioning freedom, right now only supports popover on top of target button
    const { isOpen, targetBtn, children } = this.props;

    //Calculate Top Position
    const btnRect = this.targetBtn
      ? this.targetBtn.getBoundingClientRect()
      : null;

    console.log("Target Button POS: ", btnRect);

    return (
      <Manager>
        <Reference>
          {({ ref }) => {
            //TODO: Add Support for Other Tag Names other than Button
            const clonedTarget = React.cloneElement(<Button innerRef={ref} />, {
              ...targetBtn.props
            });
            return clonedTarget;
          }}
        </Reference>
        <Popper placement="top">
          {({ ref, style, placement, arrowProps }) => {
            if (!isOpen) return null;
            //Match translate3d transform property
            const transitionMatch = Popover.translateCSSRegex.exec(
              style.transform
            );
            //Compute the right position for the popover
            const computedStyle = {
              ...style,
              display: "block",
              boxShadow: "0px 0px 10px 1px rgba(15, 15, 15, 0.2)",
              transform:
                transitionMatch != null
                  ? `translate3d(${transitionMatch[1]}px, ${parseInt(
                      transitionMatch[2]
                    ) - 18}px, ${transitionMatch[3]}px)`
                  : "translate3d(15px, 50px, 0px)"
            };
            return (
              <SafeWrapper
                innerRef={ref}
                style={computedStyle}
                data-placement={placement}
              >
                <div className="popover-container">{children}</div>
                <ArrowTail
                  direction={ArrowDirection.BOTTOM}
                  style={arrowProps.style}
                  innerRef={arrowProps.ref}
                />
              </SafeWrapper>
              /*<div ref={ref} style={style} data-placement={placement}>
                  Popper element
                  <div ref={arrowProps.ref} style={arrowProps.style} />
                </div>*/
            );
          }}
        </Popper>
      </Manager>
    );
  }
}
