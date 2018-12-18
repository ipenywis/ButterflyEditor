/*

NOT WORKING....

import * as React from "react";

import "./slider.scss";

import { Slider as SliderCp } from "@blueprintjs/core";

interface SliderProps {
  min?: number;
  max?: number;
  //If Value is provided the Slider will act in the controlled state
  value?: number | null;
  stepSize?: number;

  onChange: (value: number) => void;
}

interface SliderState {
  stateValue: number;
}

export default class Slider extends React.Component<SliderProps, SliderState> {
  state: SliderState;

  static defaultProps = {
    min: 0,
    max: 1,
    stepSize: 0.1
  };

  constructor(props: SliderProps) {
    super(props);
    this.state = {
      stateValue: 0
    };
  }

  onInputStateChange(e: React.FormEvent<HTMLInputElement>) {
    this.setState({ stateValue: parseInt(e.currentTarget.value) });
  }

  render() {
    const { min, max, value, stepSize, onChange } = this.props;
    const { stateValue } = this.state;

    return (
      <div className="range-slider">
        <input
          className="range-slider__range"
          type="range"
          value={value ? value : stateValue}
          min={min}
          max={max}
          step={stepSize}
          onInput={e =>
            value
              ? onChange(parseInt(e.currentTarget.value))
              : this.onInputStateChange(e)
          }
        />
        <span className="range-slider__value">
          {value ? value : stateValue}
        </span>
      </div>
    );
  }
}

*/
