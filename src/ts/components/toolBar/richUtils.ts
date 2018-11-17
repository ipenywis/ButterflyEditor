import { RichUtils, EditorState } from "draft-js";

//Extend the Default Draftjs RichUTILS Object with more functions and features

//Partial<> allows you to make T Class properties Optional
class RichUtilsExtended {
  static applyStyleToBlock(
    editorState: EditorState,
    styles: Partial<CSSStyleDeclaration>
  ) {
    const selection = editorState.getSelection(); ///< Current Selected Text (Cursor)
    const currentBlockKey = editorState
      .getCurrentContent()
      .getBlockForKey(selection.getStartKey())
      .get("key");
    //const matchRegx = /\w+-?\d+?-?\d+?/;
    const currentBlock = document.querySelector(
      `[data-offset-key^='${currentBlockKey}']`
    ) as HTMLDivElement;
    //Apply All Styles to Current Selected Block
    for (const p in styles) {
      currentBlock.style.setProperty(p, styles[p]);
    }
  }
}

export default Object.assign(RichUtilsExtended, RichUtils);
