import LocalStorageMock from '../localStorageMock';
import {
  clearStorage,
  readFromStorage,
  removeFromStorage,
  saveToStorage,
} from '@/services/storage';

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
    await saveToStorage('someString', str);
    await saveToStorage('someNumber', num);
    await saveToStorage('someArray', arr);
    await saveToStorage('someObject', mockObject);

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
    await saveToStorage('someObject', mockObject);

    const objFromStorage = await readFromStorage('someObject');
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
    await saveToStorage('someObject', mockObject);
    await removeFromStorage('someObject', mockObject);
    const valFromStorage = await readFromStorage('someObject');

    expect(valFromStorage).toBe(null);
  });

  it('should clear all values', async () => {
    await saveToStorage('someObject', mockObject);
    await saveToStorage('someNumber', num);
    await clearStorage();
    const objFromStorage = await readFromStorage('someObject');
    const numFromStorage = await readFromStorage('someNumber');

    expect(objFromStorage).toBe(null);
    expect(numFromStorage).toBe(null);
  });

  it('should process exception', async () => {
    const throwingFunc = jest.fn(() => {
      throw new Error('Wrong data');
    });

    ['setItem', 'getItem', 'removeItem', 'clear'].forEach(key => {
      global.localStorage[key] = throwingFunc;
    });

    await expect(readFromStorage('someObject')).rejects.toThrow('Wrong data');
    await expect(removeFromStorage('someObject')).rejects.toThrow('Wrong data');
    await expect(clearStorage()).rejects.toThrow('Wrong data');
    await expect(saveToStorage('someObject', mockObject)).rejects.toThrow(
      'Wrong data'
    );

    expect(throwingFunc).toHaveBeenCalledTimes(4);
  });
});
