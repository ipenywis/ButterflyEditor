//Import Main Editor (Imports an EditorCrea)
import EditorCreator from "../../dist/index";

const editorContainer = document.getElementById("editor-root-container");

//This will create and render the Editor Component into the target's id
EditorCreator.createEditor("editor-root-container").then(editorInstance => {
  editorInstance.console.log(
    "Current HTML: ",
    editorInstance.getExportedHTML()
  );
});
