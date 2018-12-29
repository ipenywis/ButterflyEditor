import {
  EditorState,
  ContentState,
  SelectionState,
  DraftEntityMutability,
  AtomicBlockUtils,
  Modifier
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
 * Create & Apply Entity To current EditorState (Apply to Selected Text only!)
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

  /*return EditorState.set(editorState, {
    currentContent: contentStateWithAppliedEntity
  });*/

  return RichUtils.toggleLink(
    editorStateWithEntity,
    editorStateWithEntity.getSelection(),
    entityKey
  );
};

/**
 * Create and Apply an Atomic Entity (No Selection needed, no focus, it inserts a new line after the entity and force editor focus)
 * Use this if embedding an Entity without selecting a text or elements on the Editor.
 * @param editorState
 * @param type
 * @param mutability
 * @param data
 * @returns EditorState
 */

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

export const mergeEntityData = (
  editorState: EditorState,
  decorators: any,
  entitykey: string,
  mergeData: any
): EditorState => {
  //Update Entity Instance on the Content State
  const contentState = editorState.getCurrentContent();
  //Merge Entity's new Data with already created entity using it's key
  const contentStateWithUpdatedEntity = contentState.mergeEntityData(
    entitykey,
    mergeData
  );
  //Draftjs v0.10 is not-toggling re-render when an entity data is merged and updated so therefor we have to do
  //a New Instance of EditorState with a new created instance of Decorators in order to get re-rendered
  //NOTIC: in the 0.11-alpha is being handled as would expected so we have to wait for the stable version v0.11
  //Update Editor Content
  /*let newEditorState = EditorState.set(editorState, {
     currentContent: contentStateWithUpdatedEntity
   });*/
  /*TEMP Waiting for v0.11-stable*/
  return EditorState.createWithContent(
    contentStateWithUpdatedEntity,
    decorators
  );
};

/**
 * Removes an Entity from the ContentState by finding the EntityKey and Selecting the range of characters that belongs to this Entity
 * in order to detirmine the ContentBlock to get Completely deleted from the ContentState (Async)
 * @param editorState
 * @param entityKey
 * @param decorators
 * @returns Promise<EditorState>
 */
export const removeEntity = (
  editorState: EditorState,
  entityKey: string,
  decorators: any
): Promise<EditorState> => {
  return new Promise<EditorState>((rs, rj) => {
    const contentState = editorState.getCurrentContent();
    contentState.getBlockMap().map(block => {
      block.findEntityRanges(
        character => {
          return character.getEntity() === entityKey;
        },
        (start: number, end: number) => {
          const selection = SelectionState.createEmpty(block.getKey());
          //Create a selection fro the range of the entity
          const autoSelectedCodeRange = selection.merge({
            anchorOffset: 0,
            focusOffset: block.getText().length
          });
          const newContentState = Modifier.applyEntity(
            contentState,
            autoSelectedCodeRange as SelectionState,
            null
          );
          const newEditorState: EditorState = EditorState.createWithContent(
            newContentState,
            decorators
          );
          return rs(newEditorState);
        }
      );
    });
  });
};
