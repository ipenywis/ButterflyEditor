//Image Type
import * as React from "react";
import ImageReader, { IImage } from "../../../../utils/imageReader";
import styled from "styled-components";
import Icon from "../../../toolBar/icon";
import { ContentBlock, ContentState } from "draft-js";

const ImageContainer = styled<any>("span")`
  display: inline-flex;
  width: ${({ width }: any) => width}px;
  height: ${({ height }: any) => height}px;
  position: relative;
  & > img {
    width: 100%;
    height: 100%;
  }
  &:hover > .image-editor {
    visibility: visible;
    opacity: 1;
    bottom: -15px;
  }
`;

const ImageEditor = styled<any>("div")`
  visibility: visible;
  opacity: 0;
  position: absolute;
  bottom: -26px;
  left: ${({ width }) => width / 2}px;
  transform: translate(-50%);
  background-color: #34495e;
  transition-property: bottom, opacity;
  transition: 180ms ease-in-out;
  border-radius: 3px;
  color: #fff;
  padding: 3px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

const ImageEditorBtn = styled("div")`
  min-width: 24px;
  height: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: background-color, 170ms ease-in-out;
  &:hover {
    background-color: #2b3d4e;
  }
`;

export const ImageDecoratorStartegy = (
  contentBlock: ContentBlock,
  callback: (start: number, end: number) => void,
  contentState: ContentState
) => {
  contentBlock.findEntityRanges(character => {
    const entityKey = character.getEntity();
    return (
      entityKey != null &&
      contentState.getEntity(entityKey).getType() == "IMAGE"
    );
  }, callback);
};

export function ImageDecoratorComp(
  emit: (eventName: string, ...args: any[]) => boolean
) {
  return (props: any) => {
    const image: IImage = props.contentState
      .getEntity(props.entityKey)
      .getData();
    //Normalize width and height
    const width = image.width ? image.width : 120;
    const height = image.height ? image.height : 100;
    //If Image URL presents (Use URL instead of Base64 Data, for performance Reasons)
    let compatibleImgDataOrURL = null;
    if (image.URL) {
      compatibleImgDataOrURL = image.URL;
    } else if (image.data) {
      //Check & convert Image Data if not Compatible with Web APIs (does the base64 encoded image data has pre-delimiter (data:image/png))
      //We only need the start portion of the string, for optimizing the Regex test we only get 30 chars
      compatibleImgDataOrURL = ImageReader.convertToValidBase64Data(
        image.data.toString()
      );
    }

    //Do not Render IMAGE if data or URL is not valid
    if (!compatibleImgDataOrURL) return null;

    //Handlers
    const onEditImageClick = () => {
      //Fire image edit event
      emit("EditImage", {
        url: image.URL,
        width: image.width,
        height: image.height,
        entityKey: props.entityKey
      });
    };

    const onRemoveImageClick = () => {
      //Fire Remove Image event
      emit("RemoveImage", { entityKey: props.entityKey });
    };

    return (
      <ImageContainer width={width} height={height}>
        <img src={compatibleImgDataOrURL} />
        <ImageEditor className={"image-editor"} width={width}>
          <ImageEditorBtn onClick={onEditImageClick}>
            <Icon icon={"upload"} />
          </ImageEditorBtn>
          <ImageEditorBtn onClick={onRemoveImageClick}>
            <Icon icon={"trashBin"} />
          </ImageEditorBtn>
        </ImageEditor>
      </ImageContainer>
    );
  };
}
