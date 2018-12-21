import * as React from "react";

import * as CodeMirror from "react-codemirror";

interface CodeMirrorEditorProps {}

interface CodeMirrorEditorState {}

export default class CodeMirrorEditor extends React.Component<
  CodeMirrorEditorProps,
  CodeMirrorEditorState
> {
  public state: CodeMirrorEditorState;

  constructor(props: CodeMirrorEditorProps) {
    super(props);
    this.state = {};
  }

  render() {
    //const icon = null;

    return <div />;
  }
}
