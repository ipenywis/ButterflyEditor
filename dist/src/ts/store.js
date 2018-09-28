"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const draft_js_1 = require("draft-js");
class Store extends React.Component {
    constructor(props) {
        super(props);
        //Main App State (Default State)
        this.state = {
            editorState: draft_js_1.EditorState.createEmpty()
        };
        //Register Bindings
        this.setAppState = this
            .setAppState
            .bind(this);
    }
    setAppState(newState, callback) {
        this.setState(newState, callback);
    }
    render() {
        return (React.createElement("div", { className: "main-container" }, React
            .Children
            .map(this.props.children, (child, idx) => {
            return React.cloneElement(child, {
                appState: this.state,
                setAppState: this.setAppState
            });
        })));
    }
}
exports.default = Store;
//# sourceMappingURL=store.js.map