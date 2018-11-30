/* Custom Entity Style Function (How it gets converted to HTML) since Draftjs-export-html module doesn't support all of the tags and elements conversion */

import { ContentBlock, ContentState, EntityInstance } from "draft-js";

import { renderCodeWithPrismString } from "./decorators/codeHighlighter";

/**
 * Matches an Entity range on a ContentBlock and Tries to render a string on place of entity with data
 * Use customRender for your own custom Entities Data and string formatting
 * @param block
 * @param contentState
 * @param entityType
 * @param customRenderer
 * @return string | null
 */
const exportEntity = (
  contentState: ContentState,
  block: ContentBlock,
  entityType: string,
  customRenderer?: (entity: EntityInstance) => string
): string | null => {
  //Finall Entity String output (what to actually render) (null if entity not found)
  let entityRenderer: string = null;
  block.findEntityRanges(
    character => {
      const entityKey = character.getEntity();
      return (
        entityKey != null &&
        contentState.getEntity(entityKey).getType() === entityType
      );
    },
    start => {
      const entity: EntityInstance = contentState.getEntity(
        block.getEntityAt(start)
      );
      if (entity)
        entityRenderer = customRenderer
          ? customRenderer(entity)
          : `<div>${entity && entity.getData()}</div>`;
    }
  );
  //Entity Render String
  return entityRenderer;
};

//CustomBlockRenderers have the different draft-js ContentBlock types
//(for ex: for code-block it may be a code-block type or atomic)
export default {
  blockRenderers: (contentState: ContentState) => {
    return {
      "code-block": (block: ContentBlock): string => {
        //NOTE: code-block and atomic CODE_SNIPPET is the same
        //(only because draftjs uses both so we have to put the same code on both block types)
        return exportEntity(contentState, block, "CODE_SNIPPET", entity => {
          const code = entity.getData().code;
          const language = entity.getData().language;
          let highlightedCode = renderCodeWithPrismString(code, language);
          return highlightedCode
            ? highlightedCode
            : `<pre><code shit="true">${entity && code}</code></pre>`;
        });
      },
      atomic: (block: ContentBlock): string => {
        return exportEntity(contentState, block, "CODE_SNIPPET", entity => {
          const code = entity.getData().code;
          const language = entity.getData().language;
          let highlightedCode = renderCodeWithPrismString(code, language);
          return highlightedCode
            ? highlightedCode
            : `<pre><code shit="true">${entity && code}</code></pre>`;
        });
      }
    };
  },
  entityStyleFn: (entity: any) => {
    //Switch For Available Entities
    const entityType: string = entity.getType();
    const entityData: any = entity.getData();
    switch (entityType) {
      case "ANCHOR":
        //Anchor
        return {
          element: "a",
          attributes: {
            id: entityData.anchor,
            href: "#" + entityData.anchor
          }
        };
      case "IMAGE":
        //Image Not Valid!
        if (!entityData.URL) return null;
        //Image
        return {
          element: "img",
          attributes: {
            id: entityData.name ? entityData.name : null,
            src: entityData.URL
          }
        };
    }
  }
};
