export const getShortStringWithEllipsis = (string, symbolsCount = 4) =>
  `${string.slice(0, symbolsCount)}...${string.slice(-symbolsCount)}`;

export const matchString = (a, b) => new RegExp(b, 'i').test(a);
