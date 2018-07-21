import * as React from "react";

export interface DropDownProps {
  className?: string;

  onChange?: (e : MouseEvent) => void;
  //onSelect?: (e : React.MouseEvent < any >, selected : string) => void;
}

export default class DropDown extends React.Component < DropDownProps > {

  render() {

    return (
      <select
        className={this.props.className}
        onChange={this
        .props
        .onChange
        .bind(this)}
        defaultValue="Of Course">
        {React
          .Children
          .map(this.props.children, (child, idx) => {
            if (child) 
              return <option className="dropDown-item" key={idx}>{child}</option>
          })}
      </select>
    );

  }

}

/** NOT USED! */