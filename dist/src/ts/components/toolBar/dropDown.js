"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
class DropDown extends React.Component {
    render() {
        //Container by default is select
        let renderContainer = "select";
        if (this.props.container)
            renderContainer = this.props.container;
        return (React.createElement(SafeWrapper, null,
            renderContainer == "select" && React.createElement("select", { className: this.props.className, onChange: this
                    .props
                    .onChange
                    .bind(this), defaultValue: "Of Course" }, React
                .Children
                .map(this.props.children, (child, idx) => {
                if (child)
                    return React.createElement("option", { className: "dropDown-item", key: idx }, child);
            })),
            renderContainer == "button" && "Hello Button"));
    }
}
exports.default = DropDown;
let SafeWrapper = (props) => {
    return React.createElement("div", { style: { display: "flex" } }, props.children);
};
//# sourceMappingURL=dropDown.js.map