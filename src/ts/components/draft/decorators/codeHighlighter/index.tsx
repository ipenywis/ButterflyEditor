/* All Supported Highlighters have render functions and utilities in this module to ease of use */
import * as React from "react";

import * as Prism from "prismjs";

/**
 * Renders a string Code Block into a PRE CODE (ELEMENT) supported by HTML highlighted by Prism for the Specified Language
 * Otherwise it chooses javascript as the default one.
 * @param code
 * @param language
 * @returns ReactElement
 */
export const renderCodeWithPrismJSX = (
  code: string,
  language?: string,
  wrapWithPREBlock: boolean = true
): React.ReactElement<any> => {
  //No code, don't render
  if (!code || code === "") return null;
  //Tokenize Code Block (using the default )
  const tokens: any[] = Prism.tokenize(
    code,
    Prism.languages[language || "javascript"]
  );
  //No tokens, don't render
  if (!tokens) return null;
  //Render with Prism Highlighted Tokens only if Valid (as string)
  //Check if we need to wrap it with PRE code-block tag or not
  if (wrapWithPREBlock)
    return (
      <pre>
        <code>
          {tokens.map((token, idx) => {
            return (
              <span
                className={`prism-token token ${token ? token.type : ""}`}
                key={idx}
              >
                {token.content || token}
              </span>
            );
          })}
        </code>
      </pre>
    );
  else
    return (
      <code>
        {tokens.map((token, idx) => {
          return (
            <span
              className={`prism-token token ${token.type ? token.type : ""}`}
              key={idx}
            >
              {token.content || token}
            </span>
          );
        })}
      </code>
    );
};

/**
 * Renders a string Code Block into a PRE CODE (STRING) supported by HTML highlighted by Prism for the Specified Language
 * Otherwise it chooses javascript as the default one.
 * @param code
 * @param language
 * @returns string
 */
export const renderCodeWithPrismString = (
  code: string,
  language: string
): string => {
  //No code, don't render
  if (!code || code === "") return null;
  //Tokenize Code Block (using the default )
  const tokens: any[] = Prism.tokenize(
    code,
    Prism.languages[language || "javascript"]
  );
  //Not valid, don't render
  if (!tokens) return null;
  //Render with Prism Highlighted Tokens only if Valid (as string)
  //NOTIC: join('') on map for removing the defualt comma text separation done by default by ES6 string literals
  return `<pre><code>${tokens
    .map((token, idx) => {
      return (
        `<span className="prism-token token ${
          token.type ? token.type : ""
        }" key="${idx}">` + `${token.content || token}</span>`
      );
    })
    .join("")}</code></pre>`;
};
