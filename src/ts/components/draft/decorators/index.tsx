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

/* Link Decorator */
const LinkDecoratorStrategy = (
  contentBlock: ContentBlock,
  callback: (start: number, end: number) => void,
  contentState: ContentState
) => {
  contentBlock.findEntityRanges(character => {
    const entityKey = character.getEntity();
    return (
      entityKey != null && contentState.getEntity(entityKey).getType() == "LINK"
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
  const { code } = props.contentState.getEntity(props.entityKey).getData();
  const codeLines = (code as string).split("\n");
  console.warn("Code: ", codeLines, code);

  //Line Renderer
  const renderToken = (token: any) => {
    return (
      <span className={"prism-token token " + token.type}>
        {token.content || token}
      </span>
    );

    /*return React.createElement(
      "span",
      { className: "prism-token token " + token.type },
      props.children
    );*/
  };

  const tokens: any[] = Prism.tokenize(code, Prism.languages.javascript);

  return (
    <div className="code-container">
      <pre>
        <code>
          {tokens.map((token, idx) => {
            return renderToken(token);
          })}
        </code>
      </pre>
      <span className="edit-btn">
        <Icon icon={pencil} size={13} />
      </span>
    </div>
  );

  //Let's use the Prims Code Highlighter
  /*const highlitedHTML: string = Prism.highlight(
    code,
    Prism.languages.javascript,
    "javascript"
  );*/
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
  }
]);

//All Decorators Combined (DeepDraft and ThirdParty)
/*const Decorators = new MultiDecorators([
  //The Last Decorator Will Have more prioraty
  //deepDraftDecorators,
  new PrismDecorator({ prism: Prism, filter:  })
]);*/

import CodeDecorator from "./codeDecorator";

const Decorators = deepDraftDecorators;

/* All Registered Decorators */

//export default new CodeDecorator();

export default Decorators;

/*export default new PrismDecorator({
  prism: Prism, 
  defaultSyntax: "javascript",
  filter: (block: ContentBlock) => block.getType() == "code-block"
});*/
