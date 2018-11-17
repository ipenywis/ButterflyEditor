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
