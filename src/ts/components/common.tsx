import * as React from "react";

import { EditorState, ContentState, ContentBlock, genKey } from "draft-js";

import { getSelectedBlock } from "draftjs-utils";

import { List } from "immutable";

//Flexbile wrapper that acts the same as child (style)
interface SafeWrapperProps {
  style?: React.CSSProperties;
  className?: string;

  children?: any;

  innerRef?: (ref: HTMLDivElement | null) => void;
}
export const SafeWrapper: React.SFC<SafeWrapperProps> = (
  props: SafeWrapperProps
) => {
  const newStyle: React.CSSProperties = {};
  Object.assign(newStyle, { display: "flex" }, props.style);
  return (
    <div className={props.className} style={newStyle} ref={props.innerRef}>
      {props.children}
    </div>
  );
};

/**
 * Methods
 */

/**
 * Checks if the currently Selected Draftjs Block is the Last one Being create on the DOM
 */
export const isLastBlock = (key: string) => {
  //Find in the DOM
  const elm = document.querySelector(`[data-offset-key^='${key}']`);
  const parent = elm.parentNode;
  return parent.lastChild == elm;
};

/**
 * Add New Block Map (Empty or With Text) to the End of the Content
 * @param editorState
 * @param text
 * @return New EditorState
 */
export const insertBlock = (
  editorState: EditorState,
  text = ""
): EditorState => {
  const newBlock = new ContentBlock({
    key: genKey(),
    type: "unstyled",
    text: "",
    characterList: List()
  });

  //Current Content
  const contentState = editorState.getCurrentContent();
  const blockMap = contentState
    .getBlockMap()
    .set(newBlock.get("key"), newBlock);

  const newContentState = ContentState.createFromBlockArray(
    blockMap.toArray()
  ) as ContentState;

  return EditorState.push(editorState, newContentState, "insert-fragment");
};
