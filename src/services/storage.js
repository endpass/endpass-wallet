export function readFromStorage(item) {
  return Promise.resolve()
    .then(() => localStorage.getItem(item))
    .then(val => {
      if (val !== null) {
        return JSON.parse(val);
      }

      return val;
    })
    .catch(e => {
      console.error(e);
      throw e;
    });
}

export function saveToStorage(item, val) {
  return Promise.resolve()
    .then(() => JSON.stringify(val))
    .then(strVal => localStorage.setItem(item, strVal))
    .catch(e => {
      console.error(e);
      throw e;
    });
}

export function removeFromStorage(item) {
  return Promise.resolve()
    .then(() => localStorage.removeItem(item))
    .catch(e => {
      console.error(e);
      throw e;
    });
}

export function clearStorage() {
  return Promise.resolve()
    .then(() => localStorage.clear())
    .catch(e => {
      console.error(e);
      throw e;
    });
}

export default {
  clearStorage,
  readFromStorage,
  removeFromStorage,
  saveToStorage,
};
