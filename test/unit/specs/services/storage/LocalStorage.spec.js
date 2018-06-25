import LocalStorageMock from '../../../localStorageMock';
import LocalStorage from '@/services/storage/LocalStorage';
import { NotificationError } from '@/class';

global.localStorage = LocalStorageMock;

const localStore = new LocalStorage();

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
    await localStore.write('someString', str);
    await localStore.write('someNumber', num);
    await localStore.write('someArray', arr);
    await localStore.write('someObject', mockObject);

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
    await localStore.write('someObject', mockObject);

    const objFromStorage = await localStore.read('someObject');
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
    await localStore.write('someObject', mockObject);
    await localStore.remove('someObject', mockObject);
    const valFromStorage = await localStore.read('someObject');

    expect(valFromStorage).toBe(null);
  });

  it('should clear all values', async () => {
    await localStore.write('someObject', mockObject);
    await localStore.write('someNumber', num);
    await localStore.clear();
    const objFromStorage = await localStore.read('someObject');
    const numFromStorage = await localStore.read('someNumber');

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

    await expect(localStore.read('someObject')).rejects.toThrow(
      NotificationError
    );
    await expect(localStore.remove('someObject')).rejects.toThrow(
      NotificationError
    );
    await expect(localStore.clear()).rejects.toThrow(NotificationError);
    await expect(localStore.write('someObject', mockObject)).rejects.toThrow(
      NotificationError
    );

    expect(throwingFunc).toHaveBeenCalledTimes(4);
  });
});
