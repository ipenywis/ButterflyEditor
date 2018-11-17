//Import Main Editor (Imports an EditorCrea)
import EditorCreator from "../../dist/app";

const editorContainer = document.getElementById("editor-root-container");

//This will create and render the Editor Component into the target's id
EditorCreator.createEditor("editor-root-container");
