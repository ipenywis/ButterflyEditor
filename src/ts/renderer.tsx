//React
import * as React from "react";
import * as ReactDOM from "react-dom";
//Flux Store
import Store from "./store";
//Main Rich Text Editor
import Editor from "./editor";
//DOM Rendering
ReactDOM.render(
  <Store>
    <Editor />
  </Store>,
  document.getElementById("root")
);
