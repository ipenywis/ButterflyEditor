/* All Needed Decorators for the Rich Draft Editor need to be registered here in the Fly */
import * as React from "react";
import { CompositeDecorator, ContentBlock, ContentState } from "draft-js";

/* Link Decorator */
export const LinkDecoratorStrategy = (
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

export const LinkDecoratorComp = (props: any) => {
  const { url } = props.contentState.getEntity(props.entityKey).getData();
  return (
    <a
      href={url}
      style={{
        color: "#126fc7",
        fontWeight: 500,
        textDecoration: "none",
        cursor: "text"
      }}
    >
      {props.children}
    </a>
  );
};

/* All Registered Decorators */
export default new CompositeDecorator([
  {
    strategy: LinkDecoratorStrategy,
    component: LinkDecoratorComp
  }
]);
