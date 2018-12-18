import * as React from "react";
import styled from "styled-components";
//import styledTS from "styled-components-ts";

import commonStyles, {
  backgroundColorIntent,
  textColorIntent
} from "../common/common";
import { Intent } from "../../components/intent";

interface ContainerProps {
  intent: string;
}

const Container = styled.div<ContainerProps>`
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 25px;
  right: 30px;
  padding: 9px;
  justify-self: center;
  align-self: center;
  min-width: 5em;
  max-width: 19em;
  min-height: 3em;
  max-height: 6em;
  z-index: 99;
  border-radius: 4px;
  font-family: Oxygen, sans-serif;
  font-size: 16px;
  background-color: ${(props: any) => backgroundColorIntent(props.intent)};
  color: ${(props: any) => textColorIntent(props.intent)};
  margin: 10px;
`;

const Text = styled.span`
  font-size: 20px;
`;

export interface ToastProps {
  text: string;
  intent?: Intent;
  timeout?: number;
  //If provided, it will act in controlled mode.
  isOpen?: boolean;
  enableTimeout?: boolean;

  style?: React.CSSProperties;

  onDismiss?: () => void;
}

interface ToastState {
  stateIsOpen: boolean;
}

export default class Toast extends React.Component<ToastProps, ToastState> {
  static DEFAULT_TIMEOUT: number = 2800;

  static defaultProps = {
    isOpen: true,
    intent: Intent.NONE,
    timeout: Toast.DEFAULT_TIMEOUT,
    enableTimeout: true
  };

  constructor(props: ToastProps) {
    super(props);
    this.state = {
      stateIsOpen: true
    };
  }

  public componentDidMount() {
    const { enableTimeout, timeout } = this.props;
    //Start Timeout
    if (enableTimeout && timeout) {
      setTimeout(() => {
        this.hideToast();
      }, timeout);
    }
  }

  public render() {
    //TODO: Add Support for positioning syste, right now toast only shows at the top-right corner
    const { text, intent, isOpen, style } = this.props;
    const { stateIsOpen } = this.state;

    //Unmout Toast on state change
    if (!isOpen || !stateIsOpen) return null;

    return (
      <Container intent={intent} style={style}>
        {text}
      </Container>
    );
  }

  private hideToast() {
    this.setState({ stateIsOpen: false });
  }
}
