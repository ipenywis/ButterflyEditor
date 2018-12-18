import styled from "styled-components";

//Common Styled Component Styles
const commonStyles = {
  /* Intent */
  //Background
  intentPrimaryColor: "#2980b9",
  intentDangerColor: "#e74c3c",
  intentSuccessColor: "#27ae60",
  intentInfoColor: "#f39c12",
  //Text Color
  intentPrimaryTextPolor: "#fff",
  intentDangerTextColor: "#fff",
  intentSuccessTextColor: "#fff",
  intentInfoTextColor: "#fff",
  //Minimal Color
  intentPrimaryMinimalColor: "#c1ddf0",
  intentDangerMinimalColor: "#f1c4bf",
  intentSuccessMinimalColor: "#b6f0ce",
  intentInfoMinimalColor: "#f1e1c8",

  //Hover Color
  intentPrimaryHoverColor: "#1e7ab8",
  intentDangerHoverColor: "#cf3625",
  intentSuccessHoverColor: "#1daa58",
  intentInfoHoverColor: "#d88f19",

  //Muted Text
  mutedTextColor: "#5c7080",

  //Normal Text
  textColor: "#182026"
};

//Default
export default commonStyles;

//Helpers
export const backgroundColorIntent = (intent: string): string => {
  switch (intent.toLowerCase()) {
    case "primary":
      return commonStyles.intentPrimaryColor;
    case "success":
      return commonStyles.intentSuccessColor;
    case "info":
      return commonStyles.intentInfoColor;
    case "danger":
      return commonStyles.intentDangerColor;
    default:
      return commonStyles.intentPrimaryColor;
  }
};

export const textColorIntent = (intent: string): string => {
  switch (intent.toLowerCase()) {
    case "primary":
      return commonStyles.intentPrimaryTextPolor;
    case "success":
      return commonStyles.intentSuccessTextColor;
    case "info":
      return commonStyles.intentInfoTextColor;
    case "danger":
      return commonStyles.intentDangerTextColor;
    default:
      return commonStyles.intentPrimaryColor;
  }
};
