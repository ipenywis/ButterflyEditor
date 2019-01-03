//Main Style
import "./src/sass/app.scss";
//Main Renderer
import { renderToDOM, BFlyEditor, EditorInstance } from "./src/ts/BFlyEditor";
import { EditorConfig } from "./src/ts/editorConfig";
export { EditorConfig } from "./src/ts/editorConfig";
import * as React from "react";
import * as ReactDOM from "react-dom";

//Editor Interface
export default class EditorCreator {
  constructor() {}

  /**
   * Create & Render ButterFly Editor to the DOM on the targetID element container with specific Config
   * @param targetID
   * @param config
   * @returns Promise<EditorInstance> (a promise resolved with New Editor Instance)
   */
  static async createEditor(
    targetID: string,
    config?: EditorConfig
  ): Promise<EditorInstance> {
    return new Promise<EditorInstance>(async (rs, rj) => {
      //Validate the element's id
      if (!document.getElementById(targetID)) {
        const err = `Error, ${targetID} is not a valid Element Selector!`;
        console.error(err);
        //Reject with ERROR
        return rj(err);
      }
      //Render to DOM and get Editor Instance
      const editorInstance = await renderToDOM(targetID, config).catch(e => {
        const err = "Error, Cannot Render Butterfly Editor (BFlyEditor)";
        console.error(err);
        return rj(err);
      });
      //Check if a valid editor instance
      if (!editorInstance) {
        const err = "Error, Cannot Render Butterfly Editor (BFlyEditor)";
        console.error(err);
        return rj(err);
      }
      //Resolve With Editor Instance
      return rs(editorInstance as EditorInstance);
    });
  }

  //Get BFlyEditor Component
  static getReactComponent() {
    return BFlyEditor;
  }
}

//For React we export the Editor Component
export const ButterflyEditor = BFlyEditor;
