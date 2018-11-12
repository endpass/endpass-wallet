export const merge = (...obj) =>
  obj.reduce((acc, item) => Object.assign(acc, item), {});

export default {
  merge,
};
