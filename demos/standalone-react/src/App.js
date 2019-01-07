import React from "react";
import { ButterflyEditor } from "butterfly-editor";
//make sure to import Editor style
import "butterfly-editor/dist/style.css";

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.editorConfig = {
      allowEditorFullExpand: true,
      allowHTMLExport: true
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
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
          alignItems: "center"
        }}
      >
        <h3>Butterfly Editor Demo on React (react-creat-app)</h3>
        <ButterflyEditor
          config={this.editorConfig}
          editorRef={ref => (this.textEditor = ref)}
        />
      </div>
    );
  }
}
