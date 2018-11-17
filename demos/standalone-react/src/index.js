import React from "react";
import ReactDOM from "react-dom";
import * as serviceWorker from "./serviceWorker";

//Butterfly Editor
import EditorCreator, { EditorComponent } from "../../../dist/app";

ReactDOM.render(<EditorComponent />, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
