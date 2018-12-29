/* All Needed Decorators for the Rich Draft Editor need to be registered here in the Fly */
import { CompositeDecorator, ContentBlock, ContentState } from "draft-js";
//Events
import { EventEmitter } from "events";
//Prims Code Highlighter
import * as Prism from "prismjs";
import * as React from "react";
//Main App State
import { AppState } from "../../../store";
//Icons
import Icon from "../../toolBar/icon";
//Prism CUSTOM CSS Style
import "./atomDarkStyle.css";
import { renderCodeWithPrismJSX } from "./codeHighlighter";
//Decorators Styles
import "./style.scss";
import styled from "styled-components";

//SubDecorators
import { ImageDecoratorStartegy, ImageDecoratorComp } from "./imageDecorator";

//Export a Function with Emit & On Dependecies for Easilly Emitting and Listening for Editor Events
export default function(
  emit: (eventName: string, ...args: any[]) => boolean,
  on: (
    eventName: string,
    handler: (appState?: AppState, ...args: any[]) => void
  ) => EventEmitter
) {
  /* Link Decorator */
  const LinkDecoratorStrategy = (
    contentBlock: ContentBlock,
    callback: (start: number, end: number) => void,
    contentState: ContentState
  ) => {
    contentBlock.findEntityRanges(character => {
      const entityKey = character.getEntity();
      if (
        entityKey != null &&
        contentState.getEntity(entityKey).getType() == "LINK"
      )
        return (
          entityKey != null &&
          contentState.getEntity(entityKey).getType() == "LINK"
        );
    }, callback);
  };

  const LinkDecoratorComp = (props: any) => {
    const { url, target } = props.contentState
      .getEntity(props.entityKey)
      .getData();
    return (
      <a href={url} target={target} className="dc-container">
        <span className="dc-icon">
          <Icon icon={"link"} size={17} />
        </span>
        {props.children}
      </a>
    );
  };

  /* Anchor Decorator */
  const AnchorDecoratorStrategy = (
    contentBlock: ContentBlock,
    callback: (start: number, end: number) => void,
    contentState: ContentState
  ) => {
    contentBlock.findEntityRanges(character => {
      const entityKey = character.getEntity();
      return (
        entityKey != null &&
        contentState.getEntity(entityKey).getType() == "ANCHOR"
      );
    }, callback);
  };

  const AnchorDecoratorComp = (props: any) => {
    const { anchor } = props.contentState.getEntity(props.entityKey).getData();

    return (
      <a href={"#" + anchor} id={anchor} className="dc-container">
        <span className="dc-icon">
          <Icon icon={"anchor"} size={17} />
        </span>
        {props.children}
      </a>
    );
  };

  /* Code Editor Decorator */
  const CodeEditorDecoratorStrategy = (
    contentBlock: ContentBlock,
    callback: (start: number, end: number) => void,
    contentState: ContentState
  ) => {
    contentBlock.findEntityRanges(character => {
      const entityKey = character.getEntity();
      return (
        entityKey != null &&
        contentState.getEntity(entityKey).getType() == "CODE_SNIPPET"
      );
    }, callback);
  };

  const CodeEditorDecoratorComp = (props: any) => {
    const {
      code,
      language,
      isImportedCode,
      remove
    } = props.contentState.getEntity(props.entityKey).getData();
    let highlightedCode: React.ReactElement<any> = null;
    let codeLines: string[] = null;

    //Current Code Snippet needs to be removed
    if (remove) return null;

    //Tokenize the Code using Prism or Simply don't use Code Highlighter if language is invalid or doesn't exist in the support list
    if (
      language &&
      language !== "" &&
      language !== "plaintext" &&
      Prism.languages[language]
    )
      //HighlightedCode using Prism
      //NOTE: isImportedCode is useless
      highlightedCode = renderCodeWithPrismJSX(code, language, true);
    else codeLines = (code as string).split("/n");
    //Handlers
    const onEditBtnClick = () => {
      //Emit an CodeEdit Event where the CodeEditor is already listening for when the component mounts
      //Pass current Code Snippet Entity key for Changing Data
      emit("EditCode", props.entityKey, code);
    };

    //NOTE: isImportedCode tells us if the code has been imported & converted from HTML
    //(since draftjs already applies it's own wrapping for code elements), adds pre wrapper for code (so no need to rendering it twice)

    //Render tokens with colors if available otherwise if the language is not supportd
    //or simply using a plaintext then just render code lines
    return (
      <div className="code-container">
        {highlightedCode}
        {codeLines &&
          !highlightedCode &&
          codeLines.map((code, idx) => {
            if (!isImportedCode)
              return (
                <pre key={idx} data-language={language}>
                  <code>
                    <span key={idx}>{code}</span>
                  </code>
                </pre>
              );
            else
              return (
                <code key={idx} data-language={language}>
                  <span key={idx}>{code}</span>
                </code>
              );
          })}
        <span className="edit-btn" onClick={onEditBtnClick}>
          <Icon icon={"edit"} size={12} />
        </span>
      </div>
    );
  };

  //DeepDraft Defined Decorators
  const deepDraftDecorators = new CompositeDecorator([
    {
      strategy: LinkDecoratorStrategy,
      component: LinkDecoratorComp
    },
    {
      strategy: AnchorDecoratorStrategy,
      component: AnchorDecoratorComp
    },
    {
      strategy: CodeEditorDecoratorStrategy,
      component: CodeEditorDecoratorComp
    },
    {
      strategy: ImageDecoratorStartegy,
      component: ImageDecoratorComp(emit)
    }
  ]);

  const Decorators = deepDraftDecorators;

  //FINAL EXPORTED MODULE
  return Decorators;
}
