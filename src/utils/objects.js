import { get } from 'lodash';

export const merge = (...obj) =>
  obj.reduce((acc, item) => Object.assign(acc, item), {});

export const getFrom = (target, ...paths) => {
  const existPath = paths.find(path => get(target, path));

  if (!existPath) {
    return null;
  }

  return get(target, existPath);
};

export default {
  merge,
};
