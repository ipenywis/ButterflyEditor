import { Entity } from "draft-js";

/* Custom Entity Style Function (How it gets converted to HTML) since Draftjs-export-html module doesn't support all of the tags and elements conversion */

export default {
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
    }
  }
};
