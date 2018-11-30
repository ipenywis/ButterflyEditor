import * as React from "react";
import { SafeWrapper } from "../../components/common";

//Intent
import { Intent } from "./intent";

//Style
import "./formGroup.scss";

export interface FormGroupProps {
  label: string;
  helperText?: string;
  labelInfo?: string;
  labelFor?: string;
  intent?: Intent;
}

interface FormGroupState {}

export default class FormGroup extends React.Component<
  FormGroupProps,
  FormGroupState
> {
  state: FormGroupState;

  //Default Props
  static defaultProps = {
    helperText: "",
    labelInfo: "",
    intent: Intent.PRIMARY
  };

  constructor(props: FormGroupProps) {
    super(props);
    //Initial State
    this.state = {};
  }

  render() {
    const {
      children,
      label,
      labelInfo,
      labelFor,
      helperText,
      intent
    } = this.props;
    return (
      <SafeWrapper className="form-group main-container">
        <div className="form-group inner-container">
          <label htmlFor={labelFor} className="form-group label">
            {label}{" "}
            {labelInfo && labelInfo != "" && (
              <small className="form-group label info"> ({labelInfo})</small>
            )}
          </label>
          <div className="form-group content">{children}</div>
          {helperText && helperText != "" && (
            <div
              className={`form-group helper-text intent-${intent.toLowerCase()}`}
            >
              {helperText}
            </div>
          )}
        </div>
      </SafeWrapper>
    );
  }
}
