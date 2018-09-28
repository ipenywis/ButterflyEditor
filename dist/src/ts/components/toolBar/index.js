"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
//import * as actions from "./actions"; Icons
const react_icons_kit_1 = require("react-icons-kit");
const fa_1 = require("react-icons-kit/fa/");
const controls_1 = require("./controls");
class ToolBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    updateEditorState(newEditorState, callback) {
        this
            .props
            .setAppState({
            editorState: newEditorState
        }, callback);
    }
    componentWillMount() {
        console.log("Updating...", this.state);
    }
    render() {
        let inlineStyles = [
            {
                label: "Bold",
                style: "BOLD",
                groupID: 0,
                icon: React.createElement(react_icons_kit_1.Icon, { icon: fa_1.bold })
            }, {
                label: "Italic",
                style: "ITALIC",
                groupID: 0,
                icon: React.createElement(react_icons_kit_1.Icon, { icon: fa_1.italic })
            }, {
                label: "underline",
                style: "UNDERLINE",
                groupID: 0,
                icon: React.createElement(react_icons_kit_1.Icon, { icon: fa_1.underline })
            }, {
                label: "alignRight",
                style: "ALIGN_RIGHT",
                groupID: 1,
                icon: React.createElement(react_icons_kit_1.Icon, { icon: fa_1.alignRight })
            }
        ];
        let blockTypes = [
            {
                label: "H1",
                type: "header-one",
                groupID: 0
            }, {
                label: "H2",
                type: "header-two",
                groupID: 0
            }, {
                label: "H3",
                type: "header-three",
                groupID: 0
            }, {
                label: "H4",
                type: "header-fourth",
                groupID: 0
            }, {
                label: "H5",
                type: "header-five",
                groupID: 0
            }, {
                label: "H6",
                type: "header-six",
                groupID: 0
            }
        ];
        return (React.createElement("div", { className: "toolbar" },
            React.createElement(controls_1.default, { appState: this.props.appState, setAppState: this.props.setAppState, inlineStyles: inlineStyles, blockTypes: blockTypes, updateEditorState: this
                    .updateEditorState
                    .bind(this) })));
    }
}
//Default ToolBar Icon Style
ToolBar.defaultIconStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
};
exports.default = ToolBar;
/**


<div className="t-group">
          <div
            className={"t-item " + (this.props.appState.editorState.getCurrentInlineStyle().has("BOLD")
            ? "toggle"
            : "")}
            onClick={(e) => this.toggleToolItem(e, "BOLD")}>
            <div className="t-icon"><Icon icon={bold} style={ToolBar.defaultIconStyle}/></div>
          </div>
          <div
            className={"t-item " + (_.includes(activeItems, "italic")
            ? "toggle"
            : "")}
            onClick={(e) => this.toggleToolItem(e, "italic")}>
            <div className="t-icon"><Icon icon={italic} style={ToolBar.defaultIconStyle}/></div>
          </div>
          <div
            className={"t-item " + (_.includes(activeItems, "underline")
            ? "toggle"
            : "")}
            onClick={(e) => this.toggleToolItem(e, "underline")}>
            <div className="t-icon"><Icon icon={underline} style={ToolBar.defaultIconStyle}/></div>
          </div>
        </div>
        <div className="t-group">
          <div
            className={"t-item " + (_.includes(activeItems, "alignLeft")
            ? "toggle"
            : "")}
            onClick={(e) => this.toggleToolItem(e, "alignLeft")}>
            <div className="t-icon"><Icon icon={alignLeft} style={ToolBar.defaultIconStyle}/></div>
          </div>
          <div
            className={"t-item " + (_.includes(activeItems, "alignCenter")
            ? "toggle"
            : "")}
            onClick={(e) => this.toggleToolItem(e, "alignCenter")}>
            <div className="t-icon"><Icon icon={alignCenter} style={ToolBar.defaultIconStyle}/></div>
          </div>
          <div
            className={"t-item " + (_.includes(activeItems, "alignRight")
            ? "toggle"
            : "")}
            onClick={(e) => this.toggleToolItem(e, "alignRight")}>
            <div className="t-icon"><Icon icon={alignRight} style={ToolBar.defaultIconStyle}/></div>
          </div>
          <div
            className={"t-item " + (_.includes(activeItems, "alignJustify")
            ? "toggle"
            : "")}
            onClick={(e) => this.toggleToolItem(e, "alignJustify")}>
            <div className="t-icon"><Icon icon={alignJustify} style={ToolBar.defaultIconStyle}/></div>
          </div>
        </div>



 */ 
//# sourceMappingURL=index.js.map