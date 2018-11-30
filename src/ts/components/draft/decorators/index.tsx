/* All Needed Decorators for the Rich Draft Editor need to be registered here in the Fly */
import * as React from "react";
import { CompositeDecorator, ContentBlock, ContentState } from "draft-js";

//Decorators Styles
import "./style.scss";

//Icons
import { Icon } from "react-icons-kit";
import { flag, link, pencil } from "react-icons-kit/fa/";

//Prims Code Highlighter
import * as Prism from "prismjs";
//Prism CUSTOM CSS Style
import "./atomDarkStyle.css";

//Main App State
import { AppState } from "../../../store";
//Events
import { EventEmitter } from "events";
//Image Type
import ImageReader, { IImage } from "../../../utils/imageReader";
import { renderCodeWithPrismJSX } from "./codeHighlighter";

//Export a Function with Emit & On Dependecies for Easilly Emitting and Listening for Editor Events
export default function(
  emit: (eventName: string, ...args: any[]) => boolean,
  on: (
    eventName: string,
    handler: (appState?: AppState, ...args: any[]) => void
  ) => EventEmitter
) {
  /* Link Decorator */
  const LinkDecoratorStrategy = (
    contentBlock: ContentBlock,
    callback: (start: number, end: number) => void,
    contentState: ContentState
  ) => {
    contentBlock.findEntityRanges(character => {
      const entityKey = character.getEntity();
      console.log("CHECKING IF LINK");
      if (
        entityKey != null &&
        contentState.getEntity(entityKey).getType() == "LINK"
      )
        console.log("THIS IS A LINK");
      return (
        entityKey != null &&
        contentState.getEntity(entityKey).getType() == "LINK"
      );
    }, callback);
  };

  const LinkDecoratorComp = (props: any) => {
    const { url, target } = props.contentState
      .getEntity(props.entityKey)
      .getData();
    /*Removed Style       style={{
        color: "#126fc7",
        fontWeight: 500,
        textDecoration: "none",
        cursor: "text"
      }}*/

    alert("Rendering LINK");

    return (
      <a href={url} target={target} className="dc-container">
        <span className="dc-icon">
          <Icon icon={link} size={19} />
        </span>
        {props.children}
      </a>
    );
  };

  /* Anchor Decorator */
  const AnchorDecoratorStrategy = (
    contentBlock: ContentBlock,
    callback: (start: number, end: number) => void,
    contentState: ContentState
  ) => {
    contentBlock.findEntityRanges(character => {
      const entityKey = character.getEntity();
      return (
        entityKey != null &&
        contentState.getEntity(entityKey).getType() == "ANCHOR"
      );
    }, callback);
  };

  const AnchorDecoratorComp = (props: any) => {
    const { anchor } = props.contentState.getEntity(props.entityKey).getData();

    return (
      <a href={"#" + anchor} id={anchor} className="dc-container">
        <span className="dc-icon">
          <Icon icon={flag} size={19} />
        </span>
        {props.children}
      </a>
    );
  };

  /* Code Editor Decorator */
  const CodeEditorDecoratorStrategy = (
    contentBlock: ContentBlock,
    callback: (start: number, end: number) => void,
    contentState: ContentState
  ) => {
    contentBlock.findEntityRanges(character => {
      const entityKey = character.getEntity();
      return (
        entityKey != null &&
        contentState.getEntity(entityKey).getType() == "CODE_SNIPPET"
      );
    }, callback);
  };

  const CodeEditorDecoratorComp = (props: any) => {
    const { code, language, isImportedCode } = props.contentState
      .getEntity(props.entityKey)
      .getData();
    let highlightedCode: React.ReactElement<any> = null;
    let codeLines: string[] = null;
    //Tokenize the Code using Prism or Simply don't use Code Highlighter if language is invalid or doesn't exist in the support list
    if (
      language &&
      language !== "" &&
      language !== "plaintext" &&
      Prism.languages[language]
    )
      //HighlightedCode using Prism
      //NOTE: isImportedCode is useless
      highlightedCode = renderCodeWithPrismJSX(code, language, true);
    else codeLines = (code as string).split("/n");
    //Handlers
    const onEditBtnClick = () => {
      //Emit an CodeEdit Event where the CodeEditor is already listening for when the component mounts
      //Pass current Code Snippet Entity key for Changing Data
      emit("EditCode", props.entityKey, code);
    };

    console.log(
      "RENDERING ENTITY CODE DECORATOR: ",
      code,
      language,
      isImportedCode
    );

    //NOTE: isImportedCode tells us if the code has been imported & converted from HTML
    //(since draftjs already applies it's own wrapping for code elements), adds pre wrapper for code (so no need to rendering it twice)

    //Render tokens with colors if available otherwise if the language is not supportd
    //or simply using a plaintext then just render code lines
    return (
      <div className="code-container">
        {highlightedCode}
        {codeLines &&
          !highlightedCode &&
          codeLines.map((code, idx) => {
            if (!isImportedCode)
              return (
                <pre>
                  <code>
                    <span key={idx}>{code}</span>
                  </code>
                </pre>
              );
            else
              return (
                <code>
                  <span key={idx}>{code}</span>
                </code>
              );
          })}
        <span className="edit-btn" onClick={onEditBtnClick}>
          <Icon icon={pencil} size={13} />
        </span>
      </div>
    );
  };

  /* Image Decorator */
  const ImageDecoratorStartegy = (
    contentBlock: ContentBlock,
    callback: (start: number, end: number) => void,
    contentState: ContentState
  ) => {
    contentBlock.findEntityRanges(character => {
      const entityKey = character.getEntity();
      return (
        entityKey != null &&
        contentState.getEntity(entityKey).getType() == "IMAGE"
      );
    }, callback);
  };

  const ImageDecoratorComp = (props: any) => {
    console.log("In the IMAGE ENTITY COMPONENT RENDERER");
    const image: IImage = props.contentState
      .getEntity(props.entityKey)
      .getData();
    //Normalize width and height
    const width = image.width ? image.width + "px" : "120px";
    const height = image.height ? image.height + "px" : "100px";
    //Convert IImageType to string representation
    //const imgStrType: string = ImageReader.convertTypeToStr(image.type);
    console.log("Received Image: ", image);
    //If Image URL presents (Use URL instead of Base64 Data, for performance Reasons)
    let compatibleImgDataOrURL = null;
    if (image.URL) {
      compatibleImgDataOrURL = image.URL;
    } else if (image.data) {
      //Check & convert Image Data if not Compatible with Web APIs (does the base64 encoded image data has pre-delimiter (data:image/png))
      //We only need the start portion of the string, for optimizing the Regex test we only get 30 chars
      compatibleImgDataOrURL = ImageReader.convertToValidBase64Data(
        image.data.toString()
      );
    }

    //Do not Render IMAGE if data or URL is not valid
    if (!compatibleImgDataOrURL) return null;

    return (
      <span style={{ width, height, display: "inline-flex" }}>
        <img
          src={compatibleImgDataOrURL}
          style={{ width: "100%", height: "100%" }}
        />
      </span>
    );
  };

  //DeepDraft Defined Decorators
  const deepDraftDecorators = new CompositeDecorator([
    {
      strategy: LinkDecoratorStrategy,
      component: LinkDecoratorComp
    },
    {
      strategy: AnchorDecoratorStrategy,
      component: AnchorDecoratorComp
    },
    {
      strategy: CodeEditorDecoratorStrategy,
      component: CodeEditorDecoratorComp
    },
    {
      strategy: ImageDecoratorStartegy,
      component: ImageDecoratorComp
    }
  ]);

  //All Decorators Combined (DeepDraft and ThirdParty)
  /*const Decorators = new MultiDecorators([
  //The Last Decorator Will Have more prioraty
  //deepDraftDecorators,
  new PrismDecorator({ prism: Prism, filter:  })
]);*/

  //import CodeDecorator from "./codeDecorator";

  const Decorators = deepDraftDecorators;

  /* All Registered Decorators */

  //export default new CodeDecorator();

  /*export default new PrismDecorator({
  prism: Prism, 
  defaultSyntax: "javascript",
  filter: (block: ContentBlock) => block.getType() == "code-block"
});*/

  //FINAL EXPORTED MODULE
  return Decorators;
}
