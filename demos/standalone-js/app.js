//Import Main Editor (Imports an EditorCrea)
alert("shit ghahaha WHAT");
import EditorCreator from "../../dist/app.js";
//const EditorCreator = require("../../dist/app");

const editorContainer = document.getElementById("editor-root-container");

//This will create and render the Editor Component into the target's id
EditorCreator.createEditor("editor-root-container").then(editorInstance => {
  console.log("Current HTML: ", editorInstance.getExportedHTML());
});

//ADD ME
//CHANGED HAHA

console.log("testy ANOTHER ONE eee");
