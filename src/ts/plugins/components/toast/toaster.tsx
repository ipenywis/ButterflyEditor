import * as React from "react";
import * as ReactDOM from "react-dom";
import Toast, { ToastProps } from "./toast";
import styled from "styled-components";

export type IToasterOptions = ToastProps & { key?: string };

interface IToaster {
  //Show Toast with Specified Key
  show: (props?: ToasterProps, key?: string) => void;

  //Clear Toast with Specified Key
  dismiss: (key: string) => void;

  //Kindly, Clear all Toasts
  clear: () => void;

  getToasts: () => IToasterOptions[];
}

export const ToastsWrapper = styled.div`
  display: flex;
  flex-direction: column-reverse;
  width: fit-content;
  height: fit-content;
  position: fixed;
  top: 25px;
  right: 30px;
  z-index: 99;
`;

interface ToasterProps {}

interface ToasterState {
  toasts: IToasterOptions[];
}

export default class Toaster extends React.Component<ToasterProps, ToasterState>
  implements IToaster {
  public state: ToasterState;
  private toastId: number = 0;

  constructor(props: ToasterProps) {
    super(props);
    this.state = {
      toasts: []
    };
  }

  public static create(
    props?: Partial<ToastProps>,
    container = document.body
  ): Toaster {
    //Create wrapper container
    const wrapperContainer = document.createElement("div");
    container.appendChild(wrapperContainer);
    //Render
    const toaster = ReactDOM.render(
      <Toaster {...props} />,
      wrapperContainer
    ) as Toaster;
    if (toaster == null)
      throw new Error("Error, Cannot Create & Render Toasts");

    return toaster;
  }

  //NOTE: If key is not provided, then show the latest toast crearted
  public show(props?: ToastProps, key?: string): string {
    const options = this.createToastOptions(props, key);
    if (key == undefined || this.isNewToastKey(options.key)) {
      this.setState(prevState => ({ toasts: [options, ...prevState.toasts] }));
    } else {
      this.setState(prevState => ({
        toasts: prevState.toasts.map(toast =>
          toast.key === key ? options : toast
        )
      }));
    }
    return options.key;
  }

  public dismiss(key: string) {
    this.setState(({ toasts }) => ({
      toasts: toasts.filter(t => {
        //Invoke onDismiss after timeout
        t.onDismiss();
        return t.key !== key;
      })
    }));
  }

  public dismissTimeout(key: string, timeout: number) {
    setTimeout(() => this.dismiss(key), timeout);
  }

  public clear() {
    this.state.toasts.map(t => t.onDismiss());
    this.setState({ toasts: [] });
  }

  public getToasts(): IToasterOptions[] {
    return this.state.toasts;
  }

  public render() {
    const { toasts } = this.state;

    return (
      <ToastsWrapper>
        {toasts.map(toast => {
          return (
            <Toast
              {...toast}
              style={{ position: "relative" }}
              key={toast.key}
            />
          );
        })}
      </ToastsWrapper>
    );
  }

  private createToastOptions(
    props: ToastProps,
    key = `toast-${this.toastId++}`
  ): IToasterOptions {
    //Return new Mutated Object
    return { ...props, key } as IToasterOptions;
  }

  private isNewToastKey(key: string): boolean {
    let exists = false;
    for (let toast of this.state.toasts) {
      if (toast.key == key) {
        exists = true;
        break;
      }
    }
    return exists;
  }
}
