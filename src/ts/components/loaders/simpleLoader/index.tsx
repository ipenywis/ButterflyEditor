import * as React from "react";

//Loader Style
import "./style.scss";

export enum ILoaderPosition {
  ABSOLUTE = "absolute",
  RELATIVE = "relative"
}

interface SimpleLoaderProps {
  isActive: boolean;
  className?: string;
  renderInContainer?: boolean;
  position?: ILoaderPosition;
  loaderStyle?: React.CSSProperties;
  containerStyle?: React.CSSProperties;
  size?: number;
}

interface SimpleLoaderState {}

export default class SimpleLoader extends React.Component<
  SimpleLoaderProps,
  SimpleLoaderState
> {
  state: SimpleLoaderState;

  static defaultProps = {
    renderInContainer: false,
    size: 30,
    position: ILoaderPosition.ABSOLUTE
  };

  constructor(props: SimpleLoaderProps) {
    super(props);
    this.state = {};
  }

  render() {
    const {
      isActive,
      className,
      renderInContainer,
      loaderStyle,
      containerStyle,
      position,
      size
    } = this.props;

    //Loader Final Style
    let ldStyle: React.CSSProperties = {
      ...loaderStyle,
      position,
      width: size + 7 + "px", ///< Ratio to make the loader perfectly centered on target container
      height: size + 5 + "px"
    };
    //Container Final Style
    let cnStyle: React.CSSProperties = { ...containerStyle };

    //Renderer it?
    if (!isActive) return null;
    //Render Loader in a Container
    if (renderInContainer)
      return (
        <div className="ip-loader-simple-container" style={cnStyle}>
          <div className={"ip-simple-loader " + className} style={ldStyle}>
            {Array(4)
              .fill("")
              .map((val, idx) => {
                return (
                  <div
                    style={{ width: size + "px", height: size + "px" }}
                    key={idx}
                  />
                );
              })}
          </div>
        </div>
      );
    else
      return (
        <div className={"ip-simple-loader " + className} style={ldStyle}>
          <div />
          <div />
          <div />
          <div />
        </div>
      );
  }
}
