/* Common UTILS Functions */
/**
 * Giving it a URL to validate using a REGEX Expression and returns True or False
 * @param url
 * @returns boolean
 */
export const validateURL = (url: string): boolean => {
  const URLRegex = /(https?:\/\/)?([\w.-]+(?:\.[\w\.-]+)+[\w\-\.%_~:/?#[\]@!\$&'\(\)\*\+,;=.]+)/;
  //Not NULL!
  if (!url) return false;
  //Test using REGEX
  return URLRegex.test(url);
};

export const parseSizeStr = (size: string): number => {
  if (!size || size == "" || size.trim() == "") return 0;
  const parseRegex = /^(\d+)(p?x?|e?m?)?$/;
  const match = parseRegex.exec(size);
  if (!match || match == []) return 0;
  return parseInt(match[1]);
};

export const getSVGFromSource = (src: string): SVGElement => {
  const svgContainer = document.createElement("div");
  svgContainer.innerHTML = src;
  const svg = svgContainer.firstElementChild;
  svg.remove ? svg.remove() : svgContainer.removeChild(svg); // deref from parent element
  return svg as SVGElement;
};

/**
 * Checks if part of/full Item string belongs to the list of string items[] using a Regex (So it could check a single part of the item string in the array)
 * @param list
 * @param item
 */
export const isInWithRegx = (list: string[], item: string): boolean => {
  const checkingRegex = new RegExp(`${item},?-?_?.?`);
  let found = false;
  for (let it of list) {
    if (checkingRegex.test(it)) {
      found = true;
      break;
    }
  }
  return found;
};
