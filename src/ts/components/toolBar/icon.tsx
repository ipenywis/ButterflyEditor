import * as React from "react";
import styled from "styled-components";

import InlineSVG from "svg-inline-react";

import { getSVGFromSource } from "../../utils";

const ICONS_DIR = "../../../resources/icons";
const iconSvgs = require.context("../../../resources/icons", true, /.svg$/);

interface IIcon {
  [key: string]: string;
  path: string;
  svg: string;
}
//Icon Rotation
export enum IIconRotate {
  TOP = "TOP",
  TOP_LEFT = "TOP_LEFT",
  TOP_RIGHT = "TOP_RIGHT",
  LEFT = "LEFT",
  RIGHT = "RIGHT",
  BOTTOM = "BOTTOM",
  BOTTOM_LEFT = "BOTTOM_LEFT",
  BOTTOM_RIGHT = "BOTTOM_RIGHT"
}

const icons: IIcon[] = iconSvgs.keys().reduce(
  (icons: IIcon[], path) => {
    //Convert path to a regular fileName
    const fileName: string = path.replace("./", "").replace(".svg", "");
    icons[fileName as any] = { path, svg: iconSvgs(path) };
    return icons;
  },
  [] as IIcon[]
);

//Icon Container
interface ContainerProps {
  size: number;
}
const Container = styled.i<ContainerProps>`
  width: ${({ size }: any) => size}px;
  height: ${({ size }: any) => size}px;
  fill: currentColor;
`;

//Width: inherit height: inherit

interface IconProps {
  icon: string;
  size?: number;
  style?: React.CSSProperties;
  rotation?: IIconRotate | string;
}

//Get Rotation in Degeres
export const getRotationDegs = (rotation: IIconRotate): string => {
  switch (rotation) {
    case IIconRotate.TOP:
      return "90deg";
    case IIconRotate.TOP_LEFT:
      return "45deg";
    case IIconRotate.TOP_RIGHT:
      return "135deg";
    case IIconRotate.LEFT:
      return "0deg";
    case IIconRotate.RIGHT:
      return "180deg";
    case IIconRotate.BOTTOM:
      return "270deg";
    case IIconRotate.BOTTOM_LEFT:
      return "315deg";
    case IIconRotate.BOTTOM_RIGHT:
      return "225deg";
    default:
      return null;
  }
};

const Icon: React.SFC<IconProps> = (props: IconProps) => {
  const { icon, size, style, rotation } = props;

  //Find icon specified by name on the array
  const currentIconSVG = icons[icon as any] ? icons[icon as any].svg : null;
  //No Icon Found, render nothing!
  if (!currentIconSVG) return null;

  //Rotation either from pre-defined or custom degrees value
  let rotationDegrees = getRotationDegs(rotation as IIconRotate);
  if (!rotationDegrees && rotation && rotation !== null)
    rotationDegrees = rotation as string;

  //Get SVG Element from Source
  const SVGHtml: SVGElement = getSVGFromSource(currentIconSVG);
  SVGHtml.setAttribute("fill", "currentColor");
  SVGHtml.setAttribute("width", size + "px");
  SVGHtml.setAttribute("height", size + "px");
  //Custom Style & Applying Rotation to SVG
  SVGHtml.setAttribute(
    "style",
    `display: inline-block; vertical-align: middle; align-items: center; width: inherit; height: inherit; transform: rotate(${rotationDegrees})`
  );
  return (
    <Container
      size={size}
      style={style}
      dangerouslySetInnerHTML={{ __html: SVGHtml.outerHTML }}
    />
  );
};

//Set Default Props
Icon.defaultProps = {
  size: 14,
  rotation: IIconRotate.LEFT
};

export default Icon;
