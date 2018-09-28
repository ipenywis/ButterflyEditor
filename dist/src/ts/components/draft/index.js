"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
/* DRAFT: TEXT EDITOR */
//Draftjs
const draft_js_1 = require("draft-js");
class Draft extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    updateDraftEditor(newEditorState) {
        //Update Editor State
        this
            .props
            .setAppState({ editorState: newEditorState });
    }
    render() {
        //Quick Extract
        let { appState, setAppState } = this.props;
        return (React.createElement("div", { className: "draft" },
            React.createElement("div", { className: "draft-container" },
                React.createElement(draft_js_1.Editor, { editorState: appState.editorState, onChange: this
                        .updateDraftEditor
                        .bind(this) }))));
    }
}
exports.default = Draft;
//# sourceMappingURL=index.js.map