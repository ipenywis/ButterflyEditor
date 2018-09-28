"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const ReactDOM = require("react-dom");
const store_1 = require("./store");
const editor_1 = require("./editor");
//DOM Rendering
ReactDOM.render(React.createElement(store_1.default, null,
    React.createElement(editor_1.default, null)), document.getElementById("root"));
//# sourceMappingURL=renderer.js.map