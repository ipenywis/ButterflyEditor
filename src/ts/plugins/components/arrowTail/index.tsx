import * as React from "react";

import "./arrowTail.scss";
import { SafeWrapper } from "../../../components/common";

export enum ArrowDirection {
  TOP = "TOP",
  RIGHT = "RIGHT",
  BOTTOM = "BOTTOM",
  LEFT = "LEFT"
}

interface ArrowTailProps {
  className?: string;
  style?: React.CSSProperties;
  //Arrow Pointing Direction
  direction?: ArrowDirection;

  //CSS Glow Effect on Arrow Pointer
  enableGlowEffect?: boolean;

  innerRef?: (ref: HTMLElement | null) => void;
}

interface ArrowTailState {}

export default class ArrowTail extends React.Component<
  ArrowTailProps,
  ArrowTailState
> {
  static defaultProps = {
    //Pointing Down by default
    direction: ArrowDirection.BOTTOM,
    enableGlowEffect: true
  };

  constructor(props: ArrowTailProps) {
    super(props);
  }

  render() {
    const {
      innerRef,
      className,
      style,
      direction,
      enableGlowEffect
    } = this.props;

    return (
      <SafeWrapper>
        <div className="arrow-tail-shadow" ref={innerRef} style={style} />
        {enableGlowEffect && (
          <div
            className={"arrow-tail-glow arrow-tail-" + direction.toLowerCase()}
            ref={innerRef}
            style={style}
          />
        )}
        <div
          className={
            "arrow-tail arrow-tail-" +
            direction.toLowerCase() +
            " " +
            (className ? className : "")
          }
          ref={innerRef}
          style={style}
        />
      </SafeWrapper>
    );
  }
}
