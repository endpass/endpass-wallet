export const uniq = arr =>
  arr.reduce((acc, item) => (acc.includes(item) ? acc : acc.concat(item)), []);

export const mapArrayByProp = (arr, prop) =>
  arr.reduce((acc, item) => {
    const target = item[prop];

    if (target) {
      return Object.assign(acc, {
        [target]: item,
      });
    }

    return acc;
  }, {});

export default {
  uniq,
  mapArrayByProp,
};
