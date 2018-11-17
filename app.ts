//Main Style
import "./src/sass/app.scss";
//Main Renderer
import { renderToDOM, getRenderableComponent } from "./src/ts/renderer";

//Editor Interface
export default class EditorCreator {
  constructor() {}

  static createEditor(targetID: string): boolean {
    //Validate the element's id
    if (!document.getElementById(targetID)) return false;
    //Render to DOM
    renderToDOM(targetID);
  }

  static getReactComponent() {
    return getRenderableComponent();
  }
}

//For React we export the Editor Component
export const EditorComponent = getRenderableComponent();
