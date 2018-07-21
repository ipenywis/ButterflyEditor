import * as React from "react";
import * as ReactDOM from "react-dom";

import Store from "./store";

import Editor from "./editor";

//DOM Rendering
ReactDOM.render(
  <Store><Editor/></Store>, document.getElementById("root"));