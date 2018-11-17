import { EditorState, ContentBlock } from "draft-js";

// Get Detailed Details about the Draftjs Text: Current Block Type,
// Style, Selected Text cursor Position, Current Cursor Position, Characters Count

export const getCursorStart = (editorState: EditorState): number => {
  const currentSelection = editorState.getSelection();
  return currentSelection.getStartOffset();
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
