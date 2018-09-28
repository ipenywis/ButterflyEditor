import {
  RichUtils,
  convertToRaw,
  EditorState,
  ContentState,
  SelectionState,
  Modifier
} from "draft-js";

/*interface IStyleMap {
  fontSize: {
    fontSize: 
  }
}*/

//DEFAULT Custom Inline Style Map
export let defaultStyleMap: any = {
  fontSize: {
    fontSize: "20px"
  }
};

//Toggle Inline Style From Custom Style Map (Make sure to feed it to the Draft Editor)
export function toggleInlineStyle(
  editorState: EditorState,
  styleMap: any,
  toggledStyle: any
): EditorState {
  const selection: SelectionState = editorState.getSelection();

  // Let's just allow one color at a time. Turn off all active colors.
  const nextContentState = Object.keys(styleMap).reduce(
    (contentState, style) => {
      return Modifier.removeInlineStyle(contentState, selection, style);
    },
    editorState.getCurrentContent()
  );

  let nextEditorState = EditorState.push(
    editorState,
    nextContentState,
    "change-inline-style"
  );

  const currentStyle = editorState.getCurrentInlineStyle();

  // Unset style override for current color.
  if (selection.isCollapsed()) {
    nextEditorState = currentStyle.reduce((state, style) => {
      return RichUtils.toggleInlineStyle(state, style);
    }, nextEditorState);
  }

  // If the color is being toggled on, apply it.
  if (!currentStyle.has(toggledStyle)) {
    nextEditorState = RichUtils.toggleInlineStyle(
      nextEditorState,
      toggledStyle
    );
  }

  return nextEditorState;
}

//Available Custom Inline Styles
export let customStyles = [
  "font-family",
  "font-size",
  "color",
  "background",
  "border",
  "box-shadow",
  "display",
  "margin",
  "justify-self",
  "align-self",
  "justify-content",
  "align-items"
];

//Inline STYLES
import createStyles from "draft-js-custom-styles";

//Single Style
export interface IStyle {
  toggle: (editorState: EditorState, cssPropVal: string) => EditorState;
  add: (editorState: EditorState, cssPropVal: string) => EditorState;
  remove: (editorState: EditorState, cssPropVal: string) => EditorState;
  current: (editorState: EditorState) => string;
}
//TODO: implement the interface when ever the customStyles is updated to Math the API
export interface ICreateStyle {
  styles: {
    [key: string]: IStyle | string;
    fontFamily?: IStyle | string;
    fontSize?: IStyle | string;
    color?: IStyle | string;
    background?: IStyle | string;
    border?: IStyle | string;
    boxShadow?: IStyle | string;
    display?: IStyle | string;
    margin?: IStyle | string;
    justifySelf?: IStyle | string;
    alignSelf?: IStyle | string;
    justifyContent?: IStyle | string;
    alignContent?: IStyle | string;
    //ADD MORE...
  };
  customStyleFn: () => any;
  exporter: (editorState: EditorState) => any;
}

//Object Pair Property to String Map property (ex: fontSize: 25px ==> CUSTOM_FONT_SIZE_25px) used with Draftjs Maps
export const getStringValue = (styles: ICreateStyle["styles"]): string[] => {
  let converted: string[] = [];
  for (const prop in styles) {
    //CSS Style property is composed of two parts  (first: font) & (second: Size) (the second is uppercase) (not in all cases ex: background)
    //Let's Use the help of regex
    let firstPart: string = null;
    let secondPart: string = null;
    //First make sure the style property does have an uppercase letter so you could split it into two parts
    if (prop.search(/[A-Z]/) != -1) {
      firstPart = prop.slice(0, prop.search(/[A-Z]\w+/));
      secondPart = prop.slice(prop.search(/[A-Z]\w+/));
      converted.push(
        `CUSTOM_${firstPart.toUpperCase()}_${secondPart.toUpperCase()}_${
          styles[prop]
        }`
      );
    } else {
      converted.push(`CUSTOM_${prop.toUpperCase()}_${styles[prop]}`);
    }
  }
  //It has only 1 element, then return the element instead of an array [DISABLED]
  //if (converted.length == 1) return converted[0];
  return converted;
};

//Custom Styles
export default createStyles(customStyles, "CUSTOM_") as ICreateStyle;
