//Integration Test the Editor
import * as React from "react";
import * as ReactDOM from "react-dom";
//Flux Store
import Store from "../src/ts/store";
//Main Rich Text Editor
import EditorComp from "../src/ts/editor";

//Main App
import BFlyEditor from "../app";

//Testing Utils
import { shallow, mount } from "enzyme";

describe("Initialize the Butterfly Editor", () => {
  test("Test Component mounting and rendering", () => {
    let sut = mount(BFlyEditor.getReactComponent());

    sut.find("#expand-editor-btn").simulate("click");

    expect(sut.find("#main-draft-container")).toBeDefined();
  });
});
