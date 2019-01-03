import * as React from "react";

import { Intent } from "../intent";
import { SafeWrapper } from "../../../components/common";

//Style
import "./inputGroup.scss";

enum InputType {
  TEXT = "TEXT",
  PASSWORD = "PASSWORD",
  HIDDEN = "HIDDEN"
}

export interface InputGroupProps {
  id?: string;
  className?: string;
  placeholder?: string;
  intent?: Intent;
  defaultValue?: string;
  /**If value is provided the Input will act in Controlled Mode */
  value?: string;
  type?: InputType;

  onChange?: (e?: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyPress?: (e?: React.KeyboardEvent) => void;
  inputRef?: (ref: HTMLInputElement) => void;
}

interface InputGroupState {}

export default class InputGroup extends React.Component<
  InputGroupProps,
  InputGroupState
> {
  state: InputGroupState;

  static defaultProps = {
    intent: Intent.PRIMARY,
    type: InputType.TEXT
  };

  constructor(props: InputGroupProps) {
    super(props);
    this.state = {};
  }

  render() {
    const {
      id,
      className,
      intent,
      placeholder,
      type,
      defaultValue,
      onChange,
      onKeyPress,
      inputRef,
      value
    } = this.props;

    return (
      <SafeWrapper style={{ display: "block" }}>
        {false && <span className="input-group icon" />}
        <input
          type={type.toLowerCase()}
          id={id}
          className={`input-group intent-${intent.toLowerCase()} ` + className}
          placeholder={placeholder}
          onChange={onChange}
          onKeyPress={onKeyPress}
          ref={inputRef}
          value={value || value === "" ? value : undefined}
          defaultValue={defaultValue ? defaultValue : undefined}
        />
      </SafeWrapper>
    );
  }
}
