class LocalStorage {
  static save(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  static remove(key) {
    localStorage.removeItem(key);
  }

  static load(key) {
    const res = localStorage.getItem(key);

    if (res) {
      return JSON.parse(res);
    }

    return null;
  }
}

export default LocalStorage;
