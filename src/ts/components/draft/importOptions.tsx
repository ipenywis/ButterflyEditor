import { InlineCreators, Style } from "draft-js-import-html";

import createStyle, { getCSSPropertyOfStyle } from "../toolBar/inlineStyle";

import { EntityInstance, DefaultDraftBlockRenderMap } from "draft-js";

import { Map } from "immutable";

//Entity Rule For adding Entities Import Rules (type and data)
export interface EntityRule {
  entityType: string;
  filter: (element: HTMLElement) => boolean;
  //Rule to Be Applied on Entity with type if filter returns true (returns entity import data)
  rule: (element: HTMLElement) => any;
}
//Current Added Rules
let entityRules: EntityRule[] = [];
/**
 * Add a Rule for Importing a New Type of Entity
 * Specify the element using filter
 * use rule callback for adding the specific data to get the entity renderer
 * *(Importing is when writing HTML in the editor)*
 * @param entityType
 * @param filter
 * @param rule
 */
export const addEntityImportRule = (
  entityType: string,
  filter: (element: HTMLElement) => boolean,
  rule: (element: HTMLElement) => any
) => {
  //Create Entity Rule
  let entityRule: EntityRule = { entityType, filter, rule };
  //Add Entity Rule to the Stack
  entityRules.push(entityRule);
};

/* HTML Import Options (For Converting HTML to ContentState and Set it as the Current EditorState) */
export default (
  element: HTMLElement,
  { Style, Entity }: InlineCreators
): Style | EntityInstance => {
  /* Styles */

  const stylePropertiesLeftToApply = [...Object.keys(createStyle.styles)];
  let styleToApply: string = null;
  //Check Styles
  for (const [idx, styleProperty] of stylePropertiesLeftToApply.entries()) {
    if (
      element.style[styleProperty as any] !== "" &&
      element.style[styleProperty as any] !== "none" &&
      element.style[styleProperty as any] !== null &&
      element.style[styleProperty as any] !== "null"
    ) {
      styleToApply = styleProperty;
      //Remove style from the list since it will be applied
      stylePropertiesLeftToApply.splice(idx, 1);
      //Exit the loop
      break;
    }
  }

  //Apply style if any
  if (styleToApply)
    //Style has to be formated as CUSTOM_PROPERTY_value (ex: CUSTOM_FONT_SIZE_27px) (replace dashes with underscors)
    return Style(
      `CUSTOM_${getCSSPropertyOfStyle(styleToApply)
        .replace("-", "_")
        .toUpperCase()}_${element.style[styleToApply as any]}`
    );

  /* Entities */

  //Apply Entity From Rules
  let entityInstanceIdx = 0;
  const entityInstance = entityRules.map<EntityInstance>((entityRule, idx) => {
    //Check if entity matches the filter element
    const isEntityMatch = entityRule.filter(element);
    if (isEntityMatch) {
      const entityData = entityRule.rule(element);
      //Apply Entity With Data only if it is valid
      if (entityData) {
        entityInstanceIdx = idx;
        return Entity(entityRule.entityType, entityData);
      }
    }
    return null;
  });
  //Apply Current Entity (we get first value since map return an array with one element)
  if (entityInstance[entityInstanceIdx])
    return entityInstance[entityInstanceIdx];
};

//Custom BlockRenderMap for importing Blocks from HTML (overwrite and merge with Default Draft blockRenderMap)
export const customBlockRenderMap = DefaultDraftBlockRenderMap.merge(
  Map({
    "code-block": {
      element: "figure",
      wrapper: null
    }
  })
);
