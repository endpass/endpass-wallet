export const getShortStringWithEllipsis = (string, symbolsCount = 4) =>
  `${string.slice(0, symbolsCount)}...${string.slice(-symbolsCount)}`;

export const toWords = string =>
  string
    .replace(/([A-Z]{1})/g, ' $1')
    /* eslint-disable-next-line */
    .match(/[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g)
    .map(word => word.toLowerCase());

export const toCamel = string =>
  toWords(string).reduce(
    (acc, word, i) =>
      i === 0
        ? word
        : `${acc}${word.replace(/^[a-z]/, char => char.toUpperCase())}`,
    '',
  );

export const toKebab = string => toWords(string).join('-');
