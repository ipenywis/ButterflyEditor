/* Common UTILS Functions */

export const validateURL = (url: string): boolean => {
  const URLRegex = /(https?:\/\/)?([\w.-]+(?:\.[\w\.-]+)+[\w\-\.%_~:/?#[\]@!\$&'\(\)\*\+,;=.]+)/;
  //Not NULL!
  if (!url) return false;
  //Test using REGEX
  return URLRegex.test(url);
};
