/* Register an Event on Children Elements so when clicked outside you can close the children or do what ever you would like with you event callback */

import * as React from "react";

import { addEventListener } from "consolidated-events";

//Lodash
import { includes } from "lodash";

interface OutsideClickHandlerProps {
  disabled?: boolean;
  useCapture?: boolean;
  style?: React.CSSProperties;
  //Discard an Elements (Don't include it on the event when clicking on it)
  discaredElmentsClassNames?: string[];

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
    //Remove Event Listeners
    this.removeEventListeners();
  }

  // Use mousedown/mouseup to enforce that clicks remain outside the root's
  // descendant tree, even when dragged. This should also get triggered on
  // touch devices.
  onMouseDown(e: React.MouseEvent) {
    const { useCapture, discaredElmentsClassNames } = this.props;
    //Check if the element is being mentioned as discared from the event
    /*let isDiscaredElement = false;
    let isDiscaredElementWithID = false;
    //Check Elements Array
    isDiscaredElement =
      discaredElements && includes(discaredElements, e.target as Node);
    //Check ELements with Ids Array
    isDiscaredElementWithID =
      discaredElementsIds &&
      includes(discaredElementsIds, (e.target as HTMLElement).id);

    console.log(
      "TCL: onMouseDown -> isDiscaredElementWithID",
      isDiscaredElementWithID,
      e.currentTarget,
      e.target
    );*/

    let isDiscaredElement = false;
    //Loop on Discared ClassNames
    for (const className of discaredElmentsClassNames) {
      //Check if className matches any target's classNames
      const targetClassNames = (e.target as HTMLElement).classList;
      console.log(
        "TCL: onMouseDown -> targetClassNames",
        targetClassNames,
        "Current Target:",
        (e.currentTarget as HTMLElement).classList,
        "ClassNAME: ",
        className
      );
      //See if current className is included on the target element
      if (includes(targetClassNames, className)) {
        isDiscaredElement = true;
        console.log("TCL: onMouseDown -> isDiscaredElement", isDiscaredElement);
        break; ///< stop! we found it
      }
    }

    const isDescendantOfRoot =
      this.childNode && this.childNode.contains(e.target as Node);
    if (!isDescendantOfRoot && !isDiscaredElement) {
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
    const { onOutsideClick, discaredElmentsClassNames } = this.props;

    let isDiscaredElement = false;
    //Loop on Discared ClassNames
    for (const className of discaredElmentsClassNames) {
      //Check if className matches any target's classNames
      const targetClassNames = (e.target as HTMLElement).classList;
      console.log("TCL: onMouseUp -> targetClassNames", targetClassNames);
      //See if current className is included on the target element
      if (includes(targetClassNames, className)) {
        console.log("TCL: onMouseUp -> targetClassNames", targetClassNames);
        isDiscaredElement = true;
        break; ///< stop! we found it
      }
    }

    const isDescendantOfRoot =
      this.childNode && this.childNode.contains(e.target as Node);
    if (this.removeMouseUp) this.removeMouseUp();
    this.removeMouseUp = null;

    if (!isDescendantOfRoot && !isDiscaredElement) {
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
