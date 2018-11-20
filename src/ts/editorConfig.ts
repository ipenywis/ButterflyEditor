//Main Config Structor
export interface EditorConfig {
  allowEditorFullExpand: boolean;
  allowHTMLExport: boolean;
  //TODO: Add Initial Inline Styles
}

//Default Config (Could be Overwritten)
export const DEFAULT_CONFIG: EditorConfig = {
  allowEditorFullExpand: true,
  allowHTMLExport: true
};
