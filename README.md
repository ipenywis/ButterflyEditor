# ButterflyEditor 
ButterflyEditor is an Extensible Rich Text Editor `WYSIWYG` with nice and smooth UI. Built on top of Draftjs and React for high performance. 

    ![Alt text](/demos/screenshots/butterflyEditor v1.0.0 Screenshot.png?raw=true "ButteflyEditor Screenshot")

  - Made for React and Vanilla javascript Apps 
  - Support Extensible plugins 
  - Rich Text editing the new way

# Features

  - All text editor Features 
  - Nice and Elegent UI 
  - HTML Export support 
  - Configurable Editor 

# Installation
---
The Editor package is available on NPM so simply use NPM to install it on your project.
```sh
$ npm install butterfly-editor --save 
```
##### NOTE: The Editor package comes with support of both Vanilla Javascript Implementation and a React Component  


# Usage 
---
#### 1- With Javascript App
---
For javascript apps you either use a CDN like `jsDelivr` or install the package from `NPM`.
**CDN**
```HTML
<!-- Import Editor Style -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/butterfly-editor@latest/dist/style.css"/>
<!-- And the Main Script -->
<script src="https://cdn.jsdelivr.net/npm/butterfly-editor@latest/dist/index.js"></script>
```
**You can also use another CDNs that provides NPM packages automatically.**
**We highly recommend using NPM over CDN since it is more stable.**

Now for Creating and Initializing the Editor you need to make sure you create an **EMPTY** HTML container `div` for the editor to mount and render on.
```HTML
    <div id="butterfly-editor"></div>
```
Then Create the Editor:
```javascript
<script>
    /*Run the createEditor command on the default exported EditorCreator class giving it a container id and config object*/
    EditorCreator.createEditor("butterfly-editor", { allowHTMLExport: true });
</script>
```
**Check the DOCS bellow for the Config Object and available API Methods.**

#### 2- With React App
---
For React you must use NPM to install the package since you are using a package manager like Webpack or Browserify so everything will be taken care of from your bundler you just need to install and import and the editor.
```javascript
import { ButterflyEditor } from "butterfly-editor";
//Rendering
<ButterflyEditor config={{ allowHTMLExport: true, initialHeight: "400px" }} editorRef={ref => (this.textEditor = ref)} />
```
**Check the Examples Section for more detailed implementation.**

# API Docs
---
The package has a Default Export `EditorCreator` and other named Expots like the Editor React Component `ButterflyEditor` 

**Exports:** `default` as EditorCreator |  `ButterflyEditor` | `EditorConfig` 

#### EditorCreator 
The EditorCreator is a class that allows you to directly create and initialize an editor on a specific container with `#id` or get the react component.
###### Methods
* **static CreateEditor(containerId: string. config: EditorConfig): EditorInstance**

#### ButterflyEditor React Component
###### Props:
* config: EditorConfig
* ref: (editor: EditorInstance) => void

#### EditorConfig
*  allowEditorFullExpand: boolean
*  allowHTMLExport: boolean
*  allowResize: boolean
*  initialHeight: string
*  maxHeight: string
*  fixedHeight: string

all the configs are optional, if not provided there will be an `DEFAULT` values

##### Default EditorConfig
*  allowEditorFullExpand: true
*  allowHTMLExport: true
*  allowResize: true
*  initialHeight: "200px"
*  maxHeight: null
*  fixedHeight: null
 
#### EditorInstance
* getExportedHTML(): string
* geText(): string
* onChange(callback: (newText: string, html: string) => void)
* setEditorInitialHeight(height: string)
* setEditorFixedHeight(height: string)
* setEditorMaxHeight(height: string)


# Examples 
---
**NOTE:** Full code and configuration of the examples is available inside demos/ of the Repo 

### Vanilla Javascript with Webpack 
```javascript
//Import Main Editor (Imports an EditorCrea)
import EditorCreator from "butterfly-editor";

//This will create and render the Editor Component into the target's id
EditorCreator.createEditor("editor-root-container", {
  maxHeight: "500px",
  allowHTMLExport: true,
  allowResize: true,
}).then(editorInstance => {
  //this gets printed only once the editor is initialized 
  console.log("Current HTML: ", editorInstance.getExportedHTML());

  console.log(editorInstance);
  //register an onChange callback to get updated text and html when user change something on the editor 
  editorInstance.onChange((text, html) => {
    console.log("New Text: ", text);
    console.log("New HTML: ", html);
  });
});
```
Also don't forget to import the editor style either on js scripe file and let webpack handle the css output or via standard HTML link in the head
```HTML
<link rel="stylesheet" href="path/to/node_modules/butterfly-editor/dist/style.css" />
```
### React with `create-react-app`
```javascript
import React from "react";
import EditorCreator, { ButterflyEditor } from "butterfly-editor";
//make sure to import Editor style 
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
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
          alignItems: "center"
        }}
      >
        <h3>Butterfly Editor Demo on React (create-react-app)</h3>
        <ButterflyEditor
          config={this.editorConfig}
          editorRef={ref => (this.textEditor = ref)}
        />
      </div>
    );
  }
}
```

# AUTHOR
---
**Created with :heart: and :chocolate_bar: By Islem Penywis**
**[Twitter](https://twitter.com/ipenywis)**
**[Github](https://github.com/ipenywis)**
**[Ipenywis.com](https://ipenywis.com)**
**Email: islempenywis@gmail.com**

# CONTRIBUTING
----
Please feel free to take the ButterflyEditor and add new features to it or fix bugs you found along the way of using it.
Make sure to PR you changes to make the Best Open-Source Rich Text Editor Ever for people like me and you! 

# LICENSE 
---
**MIT**
check LICENSE file for more info.
