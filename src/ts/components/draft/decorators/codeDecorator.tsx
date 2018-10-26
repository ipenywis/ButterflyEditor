import * as React from "react";

import { ContentBlock, ContentState, Entity } from "draft-js";

//var Immutable = require("immutable");

import * as Immutable from "immutable";

var KEY_SEPARATOR = "-";

import * as Prism from "prismjs";
import { callbackify } from "util";

interface DecoratorOptions {
  filter?: (
    block: ContentBlock,
    contentState: ContentState,
    callback?: (start: number, end: number, data: any) => void
  ) => void;
  syntaxt?: (block: ContentBlock) => void;
  renderer?: (props: any) => void;
}

/* Defaults */
const defaultFilter = (
  block: ContentBlock,
  contentState: ContentState,
  callback?: (start: number, end: number, data?: any) => void
) => {
  let entityData: any = {};
  block.findEntityRanges(
    character => {
      const entityKey = character.getEntity();
      const entity = contentState.getEntity(entityKey);
      entityData = entity.getData();
      console.log("TCL: Find entity ranges: entity", entity);

      //return block.getType() == "code-block";

      return (
        entityKey != null &&
        contentState.getEntity(entityKey).getType() == "CODE_SNIPPET"
      );
    },
    (start, end) => callback(start, end, entityData)
  );
};

const defaultGetSyntax = (block: ContentBlock) => {
  //TODO: Update this
  return "javascript";
};

const defaultRenderer = (props: any) => {
  console.log("TCL: defaultRenderer -> props", props);

  return React.createElement(
    "span",
    { className: "prism-token token " + props.type },
    props.children
  );
};

const occupySlice = (
  targetArr: any[],
  start: number,
  end: number,
  componentKey: any
) => {
  for (var ii = start; ii < end; ii++) {
    targetArr[ii] = componentKey;
  }
};

class CodeDecorator {
  options: DecoratorOptions;
  highlighted: any;

  constructor(options?: DecoratorOptions) {
    //Set Defaults
    if (!options) {
      this.options = {};
      this.options.filter = defaultFilter;
      this.options.syntaxt = defaultGetSyntax;
      this.options.renderer = defaultRenderer;
    } else {
      this.options = options;
    }

    this.highlighted = {};
  }

  getDecorations(
    block: ContentBlock,
    contentState: ContentState
  ): Immutable.List<string> {
    var tokens,
      token,
      tokenId,
      resultId,
      offset = 0,
      tokenCount = 0;
    var filter = this.options.filter;
    var getSyntax = this.options.syntaxt;
    var blockKey = block.getKey();
    console.log("TCL: CodeDecorator -> blockKey", blockKey);
    var blockText = block.getText();
    console.log("TCL: CodeDecorator -> blockText", blockText);
    var decorations = Array(blockText.length).fill(null);
    var highlighted = this.highlighted;

    highlighted[blockKey] = {};

    /*if (!filter(block, contentState)) {
      return Immutable.List(decorations);
    }*/

    filter(block, contentState, (entityStart, entityEnd, data) => {
      console.log("TCL: CodeDecorator -> data", data);
      //filter: used to tell which entity type to apply decoration on to for ex: SNIPPTET_CODE
      //syntax: is the current language to apply highlight to for ex: javascript
      //tokens: returned by prism tokenize which is an object holding different text parts have type and current code type of it

      //TODO: Fix this HARD Coded Code (For LANGUAGE Syntax)
      var syntax = "javascript";

      // Allow for no syntax highlighting
      if (syntax == null) {
        return Immutable.List(decorations);
      }

      // Parse text using Prism
      var grammar = Prism.languages[syntax];
      //Using Prism highlight text and return as tokens object
      tokens = Prism.tokenize(data.code, grammar);

      console.log("TCL: CodeDecorator -> tokens", tokens);

      function processToken(decorations: any, token: any, offset: any) {
        if (typeof token === "string") {
          return;
        }
        //First write this tokens full length
        tokenId = "tok" + tokenCount++;

        resultId = blockKey + "-" + tokenId;
        highlighted[blockKey][tokenId] = token;
        occupySlice(decorations, offset, offset + token.length, resultId);
        //Then recurse through the child tokens, overwriting the parent
        var childOffset = offset;
        for (var i = 0; i < token.content.length; i++) {
          var childToken = token.content[i];
          processToken(decorations, childToken, childOffset);
          childOffset += childToken.length;
        }
      }

      for (var i = 0; i < tokens.length; i++) {
        token = tokens[i];
        processToken(decorations, token, offset);
        offset += token.length;
      }
    });

    console.log("TCL: CodeDecorator -> decorations", decorations);
    return Immutable.List(decorations);
  }

  getComponentForKey(key: string) {
    console.log("TCL: CodeDecorator -> key IN GET COMPONENT", key);

    return defaultRenderer;
  }

  getPropsForKey(key: string): Object {
    var parts = key.split("-");
    var blockKey = parts[0];
    var tokId = parts[1];
    var token = this.highlighted[blockKey][tokId];
    console.log("TCL: CodeDecorator -> token", token);

    return {
      type: token.type
    };
  }
}

/**
 * Return list of decoration IDs per character
 *
 * @param {ContentBlock}
 * @return {List<String>}
 *
CodeDecorator.prototype.getDecorations = function
};

/**
 * Return component to render a decoration
 *
 * @param key {String}
 * @return {Function}
 *
CodeDecorator.prototype.getComponentForKey = function(key: any) {
    return this.options.get('render');
};

/**
 * Return props to render a decoration
 *
 * @param {String}
 * @return {Object}
 *
CodeDecorator.prototype.getPropsForKey = function(key: any) {
    var parts = key.split('-');
    var blockKey = parts[0];
    var tokId = parts[1];
    var token = this.highlighted[blockKey][tokId];

    return {
        type: token.type
    };
};

function occupySlice(targetArr: any[], start : number, end: number, componentKey: any) {
    for (var ii = start; ii < end; ii++) {
        targetArr[ii] = componentKey;
    }
}
*/

export default CodeDecorator;
