//React
import * as React from "react";
import * as ReactDOM from "react-dom";
//Flux Store
import Store from "./store";
//Main Rich Text Editor
import Editor from "./editor";
//Configuration
import { EditorConfig, DEFAULT_CONFIG } from "./editorConfig";

export class EditorInstance {
  private editorRef: Editor;

  constructor(editorRef: Editor) {
    this.editorRef = editorRef;
  }

  getExportedHTML() {
    return this.editorRef.getHTML();
  }

  onChange(callback: (newText: string, html: string) => void) {
    this.editorRef.onChange(callback);
  }

  setEditorInitialHight(height: string) {
    this.editorRef.setInitialHeight(height);
  }
  setEditorFixedHeight(height: string) {
    this.editorRef.setFixedHeight(height);
  }

  setEditorMaxHeight(height: string) {
    //TODO: Add Height Limitation
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
        //Resolve by creating a New Editor Instance Object once the Editor is Fully Rendered to the DOM
        return rs(new EditorInstance(editorRef));
      }
    );
  });
};

//React Renderable component
export interface BFlyEditorProps {
  config?: Partial<EditorConfig>;

  ref?: (ref: Editor | null) => void;
}
export class BFlyEditor extends React.Component<BFlyEditorProps> {
  constructor(props: BFlyEditorProps) {
    super(props);
  }

  render() {
    const { config, ref } = this.props;

    return (
      <Store>
        <Editor ref={ref} config={{ ...DEFAULT_CONFIG, ...config }} />
      </Store>
    );
  }
}
