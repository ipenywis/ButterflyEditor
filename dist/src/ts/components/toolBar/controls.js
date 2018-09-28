"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const _ = require("lodash");
const draft_js_1 = require("draft-js");
//DropDown
const dropDown_1 = require("./dropDown");
class Controls extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    toggleStyle(style) {
        this
            .props
            .updateEditorState(draft_js_1.RichUtils.toggleInlineStyle(this.props.appState.editorState, style));
    }
    toggleBlock(type) {
        this
            .props
            .updateEditorState(draft_js_1.RichUtils.toggleBlockType(this.props.appState.editorState, type));
    }
    render() {
        /* Inline Style Groups */
        //Find out the Number of groups of the toolbar items
        let styleItemGroups = [];
        this
            .props
            .inlineStyles
            .map((item, idx) => {
            // Array has all the other items but the one we are comaparing! let subArray =
            // this.props.toolbarItems.splice(idx, 1);
            if (!_.includes(styleItemGroups, item.groupID)) {
                //Only Add it to the Already In list if not already
                styleItemGroups.push(item.groupID);
            }
        });
        /* Block Types Groups */
        let blockItemGroups = [];
        this
            .props
            .blockTypes
            .map((item, idx) => {
            if (!_.includes(blockItemGroups, item.groupID)) {
                blockItemGroups.push(item.groupID);
            }
        });
        //Current Selected Style
        let currentStyle = this
            .props
            .appState
            .editorState
            .getCurrentInlineStyle();
        //Current Selected Block Type
        const selection = this
            .props
            .appState
            .editorState
            .getSelection(); ///< Current Selected Text (Cursor)
        const currentBlockType = this
            .props
            .appState
            .editorState
            .getCurrentContent()
            .getBlockForKey(selection.getStartKey());
        return (React.createElement("div", { className: "flex-container-horz" },
            React.createElement(RenderInlineStyles, { inlineStyles: this.props.inlineStyles, itemGroups: styleItemGroups, currentStyle: currentStyle, toggleStyle: this
                    .toggleStyle
                    .bind(this) }),
            React.createElement(RenderBlockTypes, { blockTypes: this.props.blockTypes, itemGroups: blockItemGroups, currentBlockType: currentBlockType, toggleBlock: this
                    .toggleBlock
                    .bind(this) })));
    }
}
Controls.defaultProps = {
    groupID: 0
};
exports.default = Controls;
let RenderInlineStyles = (props) => {
    let { itemGroups, currentStyle, inlineStyles, toggleStyle } = props;
    return (React.createElement("div", { style: {
            display: "flex"
        } }, itemGroups.map((groupID, gidx) => {
        return (React.createElement("div", { className: "t-group", key: gidx }, inlineStyles.map((item, idx) => {
            if (item.groupID == groupID) {
                return React.createElement("div", { className: "t-item " + (currentStyle.has((item).style)
                        ? "toggle"
                        : ""), key: item.label, onClick: () => toggleStyle((item).style) },
                    React.createElement("div", { className: "t-icon" }, (item).icon));
            }
        })));
    })));
};
//Block Types Renderer
let RenderBlockTypes = (props) => {
    let { blockTypes, currentBlockType, itemGroups, inDropDown, toggleBlock } = props;
    console.log(inDropDown);
    //Convert Label to a block type
    let getTypeFromLabel = (label) => {
        return _
            .find(blockTypes, ["label", label])
            .type;
    };
    let onDropDownChange = (e) => {
        let blockLabel = e.target.value;
        let blockType = getTypeFromLabel(blockLabel);
        console.log(blockType);
        toggleBlock(blockType);
    };
    return (React.createElement("div", { style: {
            display: "flex"
        } }, itemGroups.map((groupID, gidx) => {
        if (inDropDown)
            return React.createElement(dropDown_1.default, { className: "t-dropDown", onChange: onDropDownChange, container: "button" }, blockTypes.map((item, idx) => {
                if (item.groupID == groupID)
                    return item.label;
            }));
        if (!inDropDown)
            return React.createElement("div", { className: "t-group", key: gidx });
    })));
};
/*

          return <div className="t-dropDown" key={gidx}>
            {blockTypes.map((item, idx) => {
              if (item.groupID == groupID)
                return <div className="t-dropDown-item" key={item.label}>{item.icon
                    ? item.icon
                    : item.label}</div>
            })}
          </div>

*/
//Default Props
RenderBlockTypes.defaultProps = {
    inDropDown: true
};
//WAN PASS: 03121947 WAN USER: 036637038
//# sourceMappingURL=controls.js.map