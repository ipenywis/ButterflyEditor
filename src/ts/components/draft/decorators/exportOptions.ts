import { Entity } from "draft-js";
import ImageReader from "../../../utils/imageReader";

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
      case "IMAGE":
        //Image
        return {
          element: "img",
          attributes: {
            id: entityData.name ? entityData.name : null,
            src: ImageReader.convertToValidBase64Data(
              entityData.data,
              entityData.type
            )
          }
        };
      case "CODE":
        return {
          element: "pre"
        };
    }
  }
};
