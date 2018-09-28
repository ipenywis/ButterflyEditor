import * as React from "react";

import { addEventListener } from "consolidated-events";

interface OutsideClickHandlerProps {
  disabled?: boolean;
  useCapture?: boolean;
  style?: React.CSSProperties;

  onOutsideClick: (e?: React.MouseEvent) => void;
}

interface OutsideClickHandlerState {}

export default class OutsideClickHandler extends React.Component<
  OutsideClickHandlerProps,
  OutsideClickHandlerState
> {
  static defaultProps = {
    disabled: false,

    // `useCapture` is set to true by default so that a `stopPropagation` in the
    // children will not prevent all outside click handlers from firing - maja
    useCapture: true,
    display: "flex"
  };

  childNode: HTMLDivElement;
  removeMouseUp: () => void;
  removeMouseDown: () => void;

  constructor(props: OutsideClickHandlerProps) {
    super(props);

    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.setChildNodeRef = this.setChildNodeRef.bind(this);
  }

  componentDidMount() {
    const { disabled, useCapture } = this.props;

    if (!disabled) this.addMouseDownEventListener(useCapture);
  }

  componentWillReceiveProps(props: OutsideClickHandlerProps) {
    const { disabled: prevDisabled } = this.props;
    if (prevDisabled !== props.disabled) {
      if (props.disabled) {
        this.removeEventListeners();
      } else {
        this.addMouseDownEventListener(props.useCapture);
      }
    }
  }

  componentWillUnmount() {
    this.removeEventListeners();
  }

  // Use mousedown/mouseup to enforce that clicks remain outside the root's
  // descendant tree, even when dragged. This should also get triggered on
  // touch devices.
  onMouseDown(e: React.MouseEvent) {
    const { useCapture } = this.props;

    const isDescendantOfRoot =
      this.childNode && this.childNode.contains(e.target as Node);
    if (!isDescendantOfRoot) {
      this.removeMouseUp = addEventListener(
        document,
        "mouseup",
        this.onMouseUp,
        { capture: useCapture }
      );
    }
  }

  // Use mousedown/mouseup to enforce that clicks remain outside the root's
  // descendant tree, even when dragged. This should also get triggered on
  // touch devices.
  onMouseUp(e: React.MouseEvent) {
    const { onOutsideClick } = this.props;

    const isDescendantOfRoot =
      this.childNode && this.childNode.contains(e.target as Node);
    if (this.removeMouseUp) this.removeMouseUp();
    this.removeMouseUp = null;

    if (!isDescendantOfRoot) {
      onOutsideClick(e);
    }
  }

  setChildNodeRef(ref: HTMLDivElement) {
    this.childNode = ref;
  }

  addMouseDownEventListener(useCapture: boolean) {
    this.removeMouseDown = addEventListener(
      document,
      "mousedown",
      this.onMouseDown,
      { capture: useCapture }
    );
  }

  removeEventListeners() {
    if (this.removeMouseDown) this.removeMouseDown();
    if (this.removeMouseUp) this.removeMouseUp();
  }

  render() {
    const { children, style } = this.props;

    return (
      <div ref={this.setChildNodeRef} style={style}>
        {children}
      </div>
    );
  }
}
