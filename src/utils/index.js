export { default as http } from './http';

export const kebabToCamel = input =>
  input.replace(/-([a-z])/g, g => g[1].toUpperCase());
