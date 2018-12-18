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
