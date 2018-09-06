import LocalStorageMock from '../../../localStorageMock';
import { LocalStorage } from '@/class/storage';

global.localStorage = LocalStorageMock;

describe('Storage', () => {
  const mockObject = {
    num: 1,
    str: '1',
    arr: ['123', 123],
    obj: {
      item: '234',
      item2: 234,
    },
  };
  const { num, str, arr } = mockObject;

  beforeEach(() => {
    LocalStorageMock.clear();
  });

  it('should save value', async () => {
    await LocalStorage.write('someString', str);
    await LocalStorage.write('someNumber', num);
    await LocalStorage.write('someArray', arr);
    await LocalStorage.write('someObject', mockObject);

    const {
      someString,
      someNumber,
      someArray,
      someObject,
    } = LocalStorageMock.store;

    expect(JSON.parse(someString)).toBe(str);
    expect(JSON.parse(someNumber)).toBe(num);
    expect(JSON.parse(someArray)).toEqual(arr);
    expect(JSON.parse(someObject)).toEqual(mockObject);
  });

  it('should get right value', async () => {
    await LocalStorage.write('someObject', mockObject);

    const objFromStorage = await LocalStorage.read('someObject');
    const {
      num: numFromStorage,
      str: strFromStorage,
      arr: arrFromStorage,
    } = objFromStorage;

    expect(strFromStorage).toBe(str);
    expect(numFromStorage).toBe(num);
    expect(arrFromStorage).toEqual(arr);
    expect(objFromStorage).toEqual(mockObject);
  });

  it('should remove value', async () => {
    await LocalStorage.write('someObject', mockObject);
    await LocalStorage.remove('someObject', mockObject);
    const valFromStorage = await LocalStorage.read('someObject');

    expect(valFromStorage).toBe(null);
  });

  it('should clear all values', async () => {
    await LocalStorage.write('someObject', mockObject);
    await LocalStorage.write('someNumber', num);
    await LocalStorage.clear();
    const objFromStorage = await LocalStorage.read('someObject');
    const numFromStorage = await LocalStorage.read('someNumber');

    expect(objFromStorage).toBe(null);
    expect(numFromStorage).toBe(null);
  });
});
