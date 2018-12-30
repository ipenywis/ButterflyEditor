import { InlineStyle, BlockType, ToolbarItem } from "./controls";

import * as React from "react";

import Icon, { IIconRotate } from "./icon";

//Custom Styles
import { fontSizesStyle, fontFamiliesStyle } from "../customStyles";

//Toolbar Item standard Labels enum
import { EDITOR_TOOLBAR_LABELS } from "./common";
import { AppState } from "../../store";
import { EditorState } from "draft-js";
import { EventEmitter } from "events";

/**
 * Initialize the Toolbar Items (Using Dynamic Import System to Lower the network overhead and optimize Editor load time)
 * @param appState
 * @param on
 * @param emit
 * @param updateEditorState
 * @param toggleDraftView
 */
export const initToolbarItems = async (
  appState: AppState,
  on: (
    eventName: string,
    handler: (appState: AppState, ...args: any[]) => void
  ) => EventEmitter,
  emit: (eventName: string, ...args: any[]) => boolean,
  updateEditorState: (editorState: EditorState) => void,
  toggleDraftView: () => boolean
): Promise<{
  inlineStyles: InlineStyle[];
  blockTypes: BlockType[];
}> => {
  return new Promise<{ inlineStyles: InlineStyle[]; blockTypes: BlockType[] }>(
    async (rs, rj) => {
      //Import Plugins Dynamically
      //const { CodeEditor } = await import("../../plugins/codeEditor");
      const { ColorPicker } = await import("../../plugins/colorPicker");
      const { Anchor } = await import("../../plugins/anchor");
      const { Link } = await import("../../plugins/link");
      const { ImageUploader } = await import("../../plugins/imageUploader");

      let inlineStyles: InlineStyle[] = [
        {
          label: "Bold",
          type: "BOLD",
          groupID: 0,
          icon: <Icon icon={"bold"} />
        },
        {
          label: "Italic",
          type: "ITALIC",
          groupID: 0,
          icon: <Icon icon={"italic"} />
        },
        {
          label: "underline",
          type: "UNDERLINE",
          groupID: 0,
          icon: <Icon icon={"underline"} />
        },
        {
          label: "strike through",
          type: "STRIKE-THROUGH",
          groupID: 0,
          icon: <Icon icon={"bold"} />
        },
        {
          label: "Font Familly",
          groupID: 1,
          icon: <Icon icon={"fontFamily"} size={12} />,
          dropDown: {
            items: fontFamiliesStyle
          }
        },
        {
          label: "Font Size",
          groupID: 1,
          icon: <Icon icon={"fontSize"} size={12} />,
          dropDown: {
            items: fontSizesStyle
          }
        },
        {
          groupID: 2,
          popup: {
            standAlone: (
              <ColorPicker
                updateEditorState={updateEditorState}
                editorState={appState.editorState}
                editor={appState.editor}
                on={on}
                emit={emit}
              />
            )
          }
        },
        {
          label: EDITOR_TOOLBAR_LABELS.HTML,
          groupID: 3,
          icon: <Icon icon={"htmlView"} />,
          onSelect: () => toggleDraftView()
        },
        {
          groupID: 3,
          popup: {
            standAlone: (
              <Link
                updateEditorState={updateEditorState}
                editorState={appState.editorState}
                editor={appState.editor}
                on={on}
                emit={emit}
              />
            )
          }
        },
        {
          groupID: 3,
          popup: {
            standAlone: (
              <Anchor
                updateEditorState={updateEditorState}
                editorState={appState.editorState}
                editor={appState.editor}
                on={on}
                emit={emit}
              />
            )
          }
        },
        {
          groupID: 3,
          popup: {
            standAlone:
              /*<CodeEditor
                updateEditorState={updateEditorState}
                editorState={appState.editorState}
                editor={appState.editor}
                on={on}
                emit={emit}
              />*/
              null
          }
        }
      ];

      let blockTypes: BlockType[] = [
        {
          groupID: 0,
          popup: {
            standAlone: (
              <ImageUploader
                updateEditorState={updateEditorState}
                editorState={appState.editorState}
                editor={appState.editor}
                on={on}
                emit={emit}
                onFileUpload={file => {
                  return new Promise((rs, rj) => {
                    //TEMP only for testing it works as a server uploading Technique (Just For Visualazation)
                    setTimeout(
                      () => rj(`File Uploaded ${file.name} Successfully`),
                      2000
                    );
                  });
                }}
              />
            )
          }
        },
        {
          label: "Header",
          icon: <Icon icon={"paragraph"} />,
          groupID: 0,
          dropDown: {
            items: [
              {
                label: "H1",
                type: "header-one"
              },
              {
                label: "H2",
                type: "header-two"
              },
              {
                label: "H3",
                type: "header-three"
              },
              {
                label: "H4",
                type: "header-fourth"
              },
              {
                label: "H5",
                type: "header-five"
              },
              {
                label: "H6",
                type: "header-six"
              }
            ]
          }
        },
        {
          label: "Blockquote",
          type: "blockquote",
          groupID: 1,
          icon: <Icon icon={"quote"} />
        },
        {
          label: "UL",
          type: "unordered-list-item",
          groupID: 1,
          icon: <Icon icon={"unorderedList"} size={14} />
        },
        {
          label: "OL",
          type: "ordered-list-item",
          groupID: 1,
          icon: <Icon icon={"orderedList"} />
        }
        /*{
        label: "Code Block",
        type: "code-block",
        groupID: 1,
        icon: <Icon icon={square} />
      }
      NOTE: Code block is displayed because we have the Code Editor Plugin to rely on (more advanced) (using both may cause some unexpected bugs)
      */
      ];

      //Resolve With Initialized InlineStyles and BlockTypes items
      return rs({ inlineStyles, blockTypes });
      //me
    }
  );
};

import { ColorPicker } from "../../plugins/colorPicker";
import { Link } from "../../plugins/link";
import { Anchor } from "../../plugins/anchor";
import { ImageUploader } from "../../plugins/imageUploader";
//import { CodeEditor } from "../../plugins/codeEditor";
import CodeMirrorEditor from "../../plugins/codeEditor/codeMirrorEditor";

/**
 * Initialize the Toolbar Items Synchronously
 * @param appState
 * @param on
 * @param emit
 * @param updateEditorState
 * @param toggleDraftView
 */

export const initToolbarItemsSync = (
  appState: AppState,
  on: (
    eventName: string,
    handler: (appState: AppState, ...args: any[]) => void
  ) => EventEmitter,
  emit: (eventName: string, ...args: any[]) => boolean,
  updateEditorState: (editorState: EditorState) => void,
  toggleDraftView: () => boolean
): { inlineStyles: InlineStyle[]; blockTypes: BlockType[] } => {
  let inlineStyles: InlineStyle[] = [
    {
      label: "Bold",
      type: "BOLD",
      groupID: 0,
      icon: <Icon icon={"bold"} />
    },
    {
      label: "Italic",
      type: "ITALIC",
      groupID: 0,
      icon: <Icon icon={"italic"} />
    },
    {
      label: "underline",
      type: "UNDERLINE",
      groupID: 0,
      icon: <Icon icon={"underline"} />
    },
    {
      label: "strike through",
      type: "STRIKE-THROUGH",
      groupID: 0,
      icon: <Icon icon={"bold"} />
    },
    {
      label: "Font Familly",
      groupID: 1,
      icon: <Icon icon={"fontFamily"} />,
      dropDown: {
        items: fontFamiliesStyle
      }
    },
    {
      label: "Font Size",
      groupID: 1,
      icon: <Icon icon={"fontSize"} />,
      dropDown: {
        items: fontSizesStyle
      }
    },
    {
      groupID: 2,
      popup: {
        standAlone: (
          <ColorPicker
            updateEditorState={updateEditorState}
            editorState={appState.editorState}
            editor={appState.editor}
            on={on}
            emit={emit}
          />
        )
      }
    },
    {
      label: EDITOR_TOOLBAR_LABELS.HTML,
      groupID: 3,
      icon: <Icon icon={"htmlView"} />,
      onSelect: toggleDraftView
    },
    {
      groupID: 3,
      popup: {
        standAlone: (
          <Link
            updateEditorState={updateEditorState}
            editorState={appState.editorState}
            editor={appState.editor}
            on={on}
            emit={emit}
          />
        )
      }
    },
    {
      groupID: 3,
      popup: {
        standAlone: (
          <Anchor
            updateEditorState={updateEditorState}
            editorState={appState.editorState}
            editor={appState.editor}
            on={on}
            emit={emit}
          />
        )
      }
    },
    {
      groupID: 3,
      popup: {
        standAlone: (
          /*<CodeEditor
            updateEditorState={updateEditorState}
            editorState={appState.editorState}
            editor={appState.editor}
            on={on}
            emit={emit}
          />*/
          <CodeMirrorEditor
            updateEditorState={updateEditorState}
            editorState={appState.editorState}
            editor={appState.editor}
            on={on}
            emit={emit}
          />
        )
      }
    }
  ];

  let blockTypes: BlockType[] = [
    {
      groupID: 0,
      popup: {
        standAlone: (
          <ImageUploader
            updateEditorState={updateEditorState}
            editorState={appState.editorState}
            editor={appState.editor}
            on={on}
            emit={emit}
            onFileUpload={file => {
              return new Promise((rs, rj) => {
                //TEMP only for testing it works as a server uploading Technique (Just For Visualazation)
                setTimeout(
                  () => rj(`File Uploaded ${file.name} Successfully`),
                  2000
                );
              });
            }}
          />
        )
      }
    },
    {
      label: "Header",
      icon: <Icon icon={"paragraph"} />,
      groupID: 0,
      dropDown: {
        items: [
          {
            label: "H1",
            type: "header-one"
          },
          {
            label: "H2",
            type: "header-two"
          },
          {
            label: "H3",
            type: "header-three"
          },
          {
            label: "H4",
            type: "header-fourth"
          },
          {
            label: "H5",
            type: "header-five"
          },
          {
            label: "H6",
            type: "header-six"
          }
        ]
      }
    },
    {
      label: "Blockquote",
      type: "blockquote",
      groupID: 1,
      icon: <Icon icon={"quote"} />
    },
    {
      label: "UL",
      type: "unordered-list-item",
      groupID: 1,
      icon: <Icon icon={"unorderedList"} />
    },
    {
      label: "OL",
      type: "ordered-list-item",
      groupID: 1,
      icon: <Icon icon={"orderedList"} />
    }
    /*{
    label: "Code Block",
    type: "code-block",
    groupID: 1,
    icon: <Icon icon={square} />
  }
  NOTE: Code block is displayed because we have the Code Editor Plugin to rely on (more advanced) (using both may cause some unexpected bugs)
  */
  ];

  return { inlineStyles, blockTypes };
};
