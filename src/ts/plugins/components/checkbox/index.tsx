import * as React from "react";

import "./checkbox.scss";
import { SafeWrapper } from "../../../components/common";

import { Intent } from "../intent";
import { isBoolean } from "util";

interface CheckboxProps {
  label: string;
  checked?: boolean;
  defaultChecked?: boolean;

  intent?: Intent;

  onChange?: (checked: boolean) => void;
}

interface CheckboxState {}

export default class Checkbox extends React.Component<
  CheckboxProps,
  CheckboxState
> {
  static defaultProps = {
    defaultChecked: false,
    intent: Intent.NONE
  };

  constructor(props: CheckboxProps) {
    super(props);
  }

  render() {
    const { label, defaultChecked, checked, onChange, intent } = this.props;

    return (
      <div className={`checkbox intent-${intent.toLowerCase()}`}>
        <input
          className="checkbox"
          id="checkbox"
          type="checkbox"
          checked={checked}
          value={String(checked)}
          onChange={e =>
            onChange(e.currentTarget.value === "true" ? false : true)
          }
        />
        <label htmlFor="checkbox">{label}</label>
      </div>
    );
  }
}
