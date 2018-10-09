import { EditorState, ContentBlock } from "draft-js";

/* Get Detailed Details about the Draftjs Text: Current Block Type, Style, Selected Text cursor Position, Current Cursor Position...  */

export const getCursorStart = (editorState: EditorState): number => {
  const currentSelection = editorState.getSelection();

  return currentSelection.getStartOffset();

  /*const startKey = currentSelection.getStartKey();
  console.log("TCL: startKey", startKey);
  const endKey = currentSelection.getEndKey();
  console.log("TCL: startOffset", startOffset);
  const anchorOffset = currentSelection.getAnchorOffset();
  console.log("TCL: anchorOffset", anchorOffset);
  const anchorKey = currentSelection.getAnchorKey();
  console.log("TCL: anchorKey", anchorKey);
  console.log("TCL: endKey", endKey);
  console.log("TCL: endOffset", endOffset);
  const selectionSize = currentSelection.size;
  console.log("TCL: selectionSize", selectionSize);*/
};

export const getCursorNumSelection = (editorState: EditorState): number => {
  const currentSelection = editorState.getSelection();
  const startOffset = currentSelection.getStartOffset();
  const endOffset = currentSelection.getEndOffset();
  return !currentSelection.isCollapsed() ? endOffset - startOffset : null;
};

export const getNumCharacters = (editorState: EditorState) => {
  const contentBlocks: ContentBlock[] = editorState
    .getCurrentContent()
    .getBlockMap()
    .toArray();
  //Loop on each block and get it's length and use the reduce function to add all the blocks lengths
  return contentBlocks.reduce((prevBlockLength, currentBlock) => {
    return prevBlockLength + currentBlock.getLength();
  }, 0);
};
