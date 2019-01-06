//Main Config Structor
export interface EditorConfig {
  allowEditorFullExpand: boolean;
  allowHTMLExport: boolean;
  allowResize: boolean;
  initialHeight: string;
  maxHeight: string;
  fixedHeight: string;
  //TODO: Add Initial Inline Styles
}

//Default Config (Could be Overwritten)
export const DEFAULT_CONFIG: EditorConfig = {
  allowEditorFullExpand: true,
  allowHTMLExport: true,
  allowResize: true,
  initialHeight: "200px",
  maxHeight: null,
  fixedHeight: null
};
