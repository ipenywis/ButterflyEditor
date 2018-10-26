import * as React from "react";

//Loader Style
import "./style.scss";

interface SimpleLoaderProps {
  isActive: boolean;
  renderInContainer?: boolean;
  loaderStyle?: React.CSSProperties;
  containerStyle?: React.CSSProperties;
  width?: string;
  height?: string;
}

interface SimpleLoaderState {}

export default class SimpleLoader extends React.Component<
  SimpleLoaderProps,
  SimpleLoaderState
> {
  state: SimpleLoaderState;

  static defaultProps = {
    renderInContainer: false,
    width: "30px",
    height: "30px"
  };

  constructor(props: SimpleLoaderProps) {
    super(props);
    this.state = {};
  }

  render() {
    const {
      isActive,
      renderInContainer,
      loaderStyle,
      containerStyle,
      width,
      height
    } = this.props;

    //Loader Final Style
    let ldStyle: React.CSSProperties = { ...loaderStyle };
    //Container Final Style
    let cnStyle: React.CSSProperties = { ...containerStyle };

    //Renderer it?
    if (!isActive) return null;
    //Render Loader in a Container
    if (renderInContainer)
      return (
        <div className="ip-loader-simple-container" style={cnStyle}>
          <div className="ip-simple-loader" style={ldStyle}>
            <div />
            <div />
            <div />
            <div />
          </div>
        </div>
      );
    else
      return (
        <div className="ip-simple-loader" style={ldStyle}>
          <div />
          <div />
          <div />
          <div />
        </div>
      );
  }
}
