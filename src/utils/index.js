import store from '../store';

export { default as http } from './http';

export const kebabToCamel = input =>
  input.replace(/-([a-z])/g, g => g[1].toUpperCase());

export const getInitializedValueFromStore = (module, field) => {
  return new Promise(resolve => {
    const value = module[field];

    if (value === null) {
      const unwatch = store.watch(
        () => module[field],
        newValue => {
          unwatch();
          resolve(newValue);
        },
      );
    } else {
      resolve(value);
    }
  });
};
