//Import Main Editor (Imports an EditorCrea)
import EditorCreator from "butterfly-editor";

//This will create and render the Editor Component into the target's id
EditorCreator.createEditor("editor-root-container", {
  maxHeight: "500px"
}).then(editorInstance => {
  console.log("Current HTML: ", editorInstance.getExportedHTML());

  console.log(editorInstance);

  editorInstance.onChange((text, html) => {
    console.log("New Text: ", text);
    console.log("New HTML: ", html);
  });
});
