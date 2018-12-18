import * as React from "react";
import { Intent } from "../intent";

import "./button.scss";

//Element Ref type
type RefHandler = (ref: HTMLElement | null) => void;

interface ButtonProps {
  className?: string;
  text?: string;
  type?: string;
  minimal?: boolean;
  intent?: Intent;
  disabled?: boolean;

  innerRef?: RefHandler;

  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
}

interface ButtonState {}

//TODO: Add loading State to the Button

export default class Button extends React.Component<ButtonProps, ButtonState> {
  static defaultProps = {
    intent: Intent.NONE,
    type: "button",
    minimal: false,
    disabled: false
  };

  constructor(props: ButtonProps) {
    super(props);
  }

  render() {
    const {
      className,
      text,
      type,
      minimal,
      intent,
      onClick,
      children,
      disabled,
      innerRef
    } = this.props;

    return (
      <button
        type={type}
        className={
          "btn intent-" +
          intent.toLowerCase() +
          (minimal ? " minimal" : "") +
          (disabled ? " disabled " : " ") +
          className
        }
        onClick={onClick}
        disabled={disabled}
        ref={innerRef}
      >
        {text || children}
      </button>
    );
  }
}
