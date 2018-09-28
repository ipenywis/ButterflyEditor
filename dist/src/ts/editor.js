"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
//Toolbar and Draft Editor
const draft_1 = require("./components/draft");
const toolBar_1 = require("./components/toolBar");
class Editor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    render() {
        return (React.createElement("div", { className: "editor-container" },
            React.createElement(toolBar_1.default, { appState: this.props.appState, setAppState: this.props.setAppState }),
            React.createElement(draft_1.default, { appState: this.props.appState, setAppState: this.props.setAppState })));
    }
}
exports.default = Editor;
//# sourceMappingURL=editor.js.map