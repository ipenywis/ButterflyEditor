"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const draft_js_1 = require("draft-js");
function toggleBoldStyle(self, active = true) {
    let { appState, setAppState } = self.props;
    // console.log(draftToHtml(convertToRaw(appState.editorState.getCurrentContent())
    // ));
    let currentInlineStyle = appState
        .editorState
        .getCurrentInlineStyle();
    let newEditorState = draft_js_1.RichUtils.toggleInlineStyle(appState.editorState, "BOLD");
    setAppState({ editorState: newEditorState });
}
exports.toggleBoldStyle = toggleBoldStyle;
//# sourceMappingURL=actions.js.map