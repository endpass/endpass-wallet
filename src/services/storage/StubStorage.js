export default class StubStorage {
  read() {
    return Promise.resolve();
  }

  readAll() {
    return Promise.resolve();
  }

  write() {
    return Promise.resolve();
  }

  writeBulk() {
    return Promise.resolve();
  }

  remove() {
    return Promise.resolve();
  }

  clear() {
    return Promise.resolve();
  }
}
