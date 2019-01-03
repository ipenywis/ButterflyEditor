import React from "react";

import EditorCreator, { ButterflyEditor } from "butterfly-editor";
import "butterfly-editor/dist/style.css";

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.editorConfig = {
      allowEditorFullExpand: true,
      allowHTMLExport: false
    };
  }

  componentDidMount() {
    //Register OnChange Callback for listening for new text & HTML changes on the Butterfly Editor
    this.textEditor.onChange((text, html) => {
      console.log("Editor Text Changed: ", text, html);
    });
  }

  render() {
    return (
      <div>
        <h3>Butterfly Editor Demo on React (react-creat-app)</h3>
        <ButterflyEditor
          config={this.editorConfig}
          editorRef={ref => (this.textEditor = ref)}
        />
      </div>
    );
  }
}
