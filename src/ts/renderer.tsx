//React
import * as React from "react";
import * as ReactDOM from "react-dom";
//Flux Store
import Store from "./store";
//Main Rich Text Editor
import Editor from "./editor";
//Configuration
import { EditorConfig } from "./editorConfig";

export class EditorInstance {
  private editorRef: Editor;

  constructor(editorRef: Editor) {
    this.editorRef = editorRef;
  }

  getExportedHTML() {
    return this.editorRef.getHTML();
  }

  //TODO: Add Markdown Export support
}

export const renderToDOM = (
  targetID: string,
  config?: EditorConfig
): Promise<EditorInstance> => {
  return new Promise((rs, rj) => {
    let editorRef: Editor;

    //DOM Rendering
    ReactDOM.render(
      <Store>
        <Editor ref={editor => (editorRef = editor)} config={config} />
      </Store>,
      document.getElementById(targetID),
      () => {
        console.warn("EDITOR FULL DOM RENDERING...");
        //Resolve by creating a New Editor Instance Object once the Editor is Fully Rendered to the DOM
        return rs(new EditorInstance(editorRef));
      }
    );
  });
};

//React Renderable component
export interface BFlyEditorProps {
  config?: EditorConfig;
}
export class BFlyEditor extends React.Component<BFlyEditorProps> {
  constructor(props: BFlyEditorProps) {
    super(props);
  }

  render() {
    const { config } = this.props;

    return (
      <Store>
        <Editor config={config} />
      </Store>
    );
  }
}
