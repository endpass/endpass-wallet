export const merge = (...obj) =>
  obj.reduce((acc, item) => Object.assign(acc, item), {});

export const pick = (obj, entries) =>
  entries.reduce((acc, key) => {
    const target = obj[key];

    if (target) {
      return Object.assign(acc, {
        [key]: target,
      });
    }

    return acc;
  }, {});

export const pickBy = (obj, predicate) =>
  Object.keys(obj).reduce((acc, key) => {
    const target = obj[key];

    if (predicate(target)) {
      return Object.assign(acc, {
        [key]: target,
      });
    }

    return acc;
  }, {});

export default {
  merge,
  pick,
  pickBy,
};
