import {
  EditorState,
  ContentState,
  Modifier,
  DraftEntityMutability,
  AtomicBlockUtils
} from "draft-js";

import RichUtils from "../toolBar/richUtils";

type EntityData = string | Object | any;
/*
export const createEntity = (editorState: EditorState, type: string, mutability: DraftEntityMutability, data: EntityData): EditorState => {
  const currentContent = editorState.getCurrentContent();
  //Apply Entity and Make new ContentState 
  EditorState.push(editorState, currentContent, "apply")
};

export const getLastEntityKey = (editorState: EditorState): string => {
  return editorState.getCurrentContent().getLastCreatedEntityKey();
}
*/
/**
 * Create & Apply Entity To current EditorState
 * @param editorState
 * @param type
 * @param mutability
 * @param data
 * @returns EditorState
 */

export const applyEntity = (
  editorState: EditorState,
  type: string,
  mutability: DraftEntityMutability,
  data: EntityData
): EditorState => {
  const currentContent = editorState.getCurrentContent();
  //Create Entity
  const contentStateWithCreatedEntity: ContentState = currentContent.createEntity(
    type,
    mutability,
    data
  );
  //Get current Entity's Key
  const entityKey: string = contentStateWithCreatedEntity.getLastCreatedEntityKey();
  const editorStateWithEntity = EditorState.set(editorState, {
    currentContent: contentStateWithCreatedEntity
  });
  //Apply Entity with Key using Modifier
  /*const contentStateWithAppliedEntity = Modifier.applyEntity(
    editorState.getCurrentContent(),
    editorState.getSelection(),
    entityKey
  );*/

  /* return EditorState.set(editorState, {
    currentContent: contentStateWithAppliedEntity
  });*/

  return RichUtils.toggleLink(
    editorStateWithEntity,
    editorStateWithEntity.getSelection(),
    entityKey
  );
};

export const applyAtomicEntity = (
  editorState: EditorState,
  type: string,
  mutability: DraftEntityMutability,
  data: EntityData
): EditorState => {
  const currentContent = editorState.getCurrentContent();
  //Create Entity
  const contentStateWithCreatedEntity: ContentState = currentContent.createEntity(
    type,
    mutability,
    data
  );
  //Get current Entity's Key
  const entityKey: string = contentStateWithCreatedEntity.getLastCreatedEntityKey();
  /* Atomic Line used to insert entities that does not require selection */

  //New Atomic Line
  let newEditorState = AtomicBlockUtils.insertAtomicBlock(
    editorState,
    entityKey,
    " "
  );
  //Force Selection after current cursor block
  return EditorState.forceSelection(
    newEditorState,
    newEditorState.getCurrentContent().getSelectionAfter()
  );
};
