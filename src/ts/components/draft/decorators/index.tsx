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

//Prism Decorator
const PrismDecorator = require("draft-js-prism");

//MultiDecorators Combiner
import * as MultiDecorators from "draft-js-multidecorators";
//Main App State
import { AppState } from "../../../store";
//Events
import { EventEmitter } from "events";
//Image Type
import ImageReader, { IImage } from "../../../utils/imageReader";

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
    const { code, language } = props.contentState
      .getEntity(props.entityKey)
      .getData();

    //Line of Code Renderer (using Prism classes and tokens)
    const renderToken = (token: any) => {
      return (
        <span className={"prism-token token " + token.type}>
          {token.content || token}
        </span>
      );
    };
    //Tokenize the Code using Prism
    const tokens: any[] = Prism.tokenize(code, Prism.languages["language"]);

    //Handlers
    const onEditBtnClick = () => {
      //Emit an CodeEdit Event where the CodeEditor is already listening for when the component mounts
      emit("EditCode", code);
    };

    return (
      <div className="code-container">
        <pre>
          <code>
            {tokens.map((token, idx) => {
              return renderToken(token);
            })}
          </code>
        </pre>
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
    console.log("Finding IMAGE");
    contentBlock.findEntityRanges(character => {
      const entityKey = character.getEntity();
      return (
        entityKey != null &&
        contentState.getEntity(entityKey).getType() == "IMAGE"
      );
    }, callback);
  };

  const ImageDecoratorComp = (props: any) => {
    const image: IImage = props.contentState
      .getEntity(props.entityKey)
      .getData();
    //Normalize width and height
    const width = image.width ? image.width + "px" : "120px";
    const height = image.height ? image.height + "px" : "100";
    //Convert IImageType to string representation
    const imgStrType: string = ImageReader.convertTypeToStr(image.type);

    //Check & convert Image Data if not Compatible with Web APIs (does the base64 encoded image data has pre-delimiter (data:image/png))
    //We only need the start portion of the string, for optimizing the Regex test we only get 30 chars
    let compatibleImgData = ImageReader.convertToValidBase64Data(
      image.data.toString()
    );

    return (
      <span style={{ width, height, display: "inline-flex" }}>
        <img
          src={compatibleImgData}
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
