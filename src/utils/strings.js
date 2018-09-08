export const getShortStringWithEllipsis = (string, symbolsCount = 4) =>
  `${string.slice(0, symbolsCount)}...${string.slice(-symbolsCount)}`;
