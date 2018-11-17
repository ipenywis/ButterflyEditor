//React
import * as React from "react";
import * as ReactDOM from "react-dom";
//Flux Store
import Store from "./store";
//Main Rich Text Editor
import Editor from "./editor";

export const renderToDOM = (targetID: string) => {
  //DOM Rendering
  ReactDOM.render(
    <Store>
      <Editor />
    </Store>,
    document.getElementById(targetID)
  );
};

//React Renderable component
export const getRenderableComponent = () => (
  <Store>
    <Editor />
  </Store>
);
