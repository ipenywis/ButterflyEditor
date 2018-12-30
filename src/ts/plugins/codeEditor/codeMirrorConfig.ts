/*export const CODE_EDITOR_LANGUAGES: string[] = [
  "javascript",
  "CSS",
  "SCSS",
  "htmlmixed",
  "xml",
  "markdown",
  "C",
  "C++",
  "C#",
  "Java",
  "Objective-C",
  "Kotlin",
  "Scala",
  "celyon",
  "PHP",
  "CMake",
  "SQL",
  "HTTP",
  "GO",
  "Dart"
];*/

export const CODE_EDITOR_LANGUAGES: string[] = ["javascript"];

export const loadCodeMirrorLanguages = (
  languages: string | string[]
): boolean => {
  if (typeof languages === "string")
    require(`codemirror/mode/${languages}/${languages}`);
  else {
    if (!languages || languages === []) return false;
    languages.map(lang => {
      require(`codemirror/mode/${lang}/${lang}`);
    });
  }
};

export const getCodeMirrorLanguage = (language: string): string => {
  const lang = language.toLowerCase();
  switch (lang) {
    case "javascript":
    case "js":
      return "javascript";
    case "html":
      return "htmlmixed";
    case "java":
    case "c":
    case "c++":
    case "c#":
    case "csharp":
    case "cpp":
    case "objective-c":
    case "kotlin":
    case "scala":
    case "celyon":
      return "clike";
    case "scss":
    case "sass":
      return "sass";
    default:
      return lang;
  }
};

/**
 * Get CodeMirror languages specific model names for a set of regular programming languages, frameworks names
 * @param languages
 * @returns string[]
 */
export const getCodeMirrorLanguages = (languages: string[]): string[] => {
  let codeMirrorLangs: string[] = [];
  languages.map(lang => {
    codeMirrorLangs.push(getCodeMirrorLanguage(lang));
  });
  return codeMirrorLangs;
};
