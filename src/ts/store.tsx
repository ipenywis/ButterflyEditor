import * as React from "react";

import { EditorState, Editor } from "draft-js";

//Style Map
import { defaultStyleMap } from "./components/toolBar/inlineStyle";

import Popup from "./components/popup";

//Event Emitter
import { EventEmitter } from "events";

//Decorators on the Fly
import Decorators from "./components/draft/decorators";

//Shared State Between Childrens (Like Redux/Flux App Store)
export interface AppState {
  editorState: EditorState;
  editor: Editor;
  editorHasFocus: boolean;
  showDraftHTML: boolean;
  activeItems: string[];
}

export interface AppProps {}

export default class Store extends React.Component {
  state: AppState;

  //EventEmitter
  private eventEmitter: EventEmitter;
  storedEvents: any;

  constructor(props: AppProps) {
    super(props);

    //Main App State (Default State) (Initialize EditorState with Decorators)
    this.state = {
      editorState: EditorState.createEmpty(
        Decorators(this.emit.bind(this), this.on.bind(this))
      ),
      editor: null,
      editorHasFocus: false,
      showDraftHTML: false,
      activeItems: []
    };
    //Register Bindings
    this.setAppState = this.setAppState.bind(this);
    this.setAppStateClb = this.setAppStateClb.bind(this);
    this.emit = this.emit.bind(this);
    this.on = this.on.bind(this);

    //Event Emitter
    this.eventEmitter = new EventEmitter();
  }

  emit(eventName: string, ...args: any[]): boolean {
    //Pass the Emit to the EventEmitter
    return this.eventEmitter.emit(eventName, args);
  }

  on(
    eventName: string,
    handler: (appState?: AppState, ...args: any[]) => void
  ): EventEmitter {
    //All Registered Listeners at this point
    let listeners = this.eventEmitter.listeners("EditorBlur");
    //Check if the Event listener is already registered on the EventEmitter
    let listenerAlreadyRegistered = false;
    for (const fun of listeners) {
      //We convert functions to string to check their idantical values (scopes).
      //we cannot check if two functions does the same thing in a different ways or using different algorithms.
      if (fun.toString() == handler.toString()) {
        listenerAlreadyRegistered = true;
        break; ///< Get out of the loop for Performance do not check the rest of the listeners (We already Got we we need)
      }
    }
    //Get out, do not add the listener since it's the same one (Propablt the on method is being called on a loop or a React Component gets mounted repeadtly)
    if (listenerAlreadyRegistered) return this.eventEmitter;

    //Pass it to the Event Emitter On Handler if it doesn't exist
    return this.eventEmitter.on(eventName, args => handler(this.state, args));
  }

  //Set Global App State
  setAppState(newState: any, callback: () => void) {
    this.setState(newState, callback);
  }

  setAppStateClb(callback?: (prevState: AppState) => void) {
    this.setState(callback);
  }

  componentWillUpdate() {}

  render() {
    return (
      <div className="main-container">
        {React.Children.map(this.props.children, (child, idx) => {
          return React.cloneElement(child as React.ReactElement<any>, {
            appState: this.state,
            setAppState: this.setAppState,
            setAppStateClb: this.setAppStateClb,
            on: this.on.bind(this),
            emit: this.emit.bind(this)
          });
        })}
      </div>
    );
  }
}
