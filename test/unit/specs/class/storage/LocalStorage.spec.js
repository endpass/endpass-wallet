const LocalStorage = require.requireActual('@/class/storage/LocalStorage')
  .default;

describe('LocalStorage', () => {
  describe('save', () => {
    it('should call localStorage.setItem method with stringified value', () => {
      const dataToSave = { bar: 'baz' };

      LocalStorage.save('foo', dataToSave);

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'foo',
        JSON.stringify(dataToSave),
      );
    });
  });

  describe('remove', () => {
    it('should call localStorage.removeItem method', () => {
      LocalStorage.remove('foo');

      expect(localStorage.removeItem).toHaveBeenCalledWith('foo');
    });
  });

  describe('load', () => {
    it('should call localStorage.getItem method and returns parsed value', () => {
      const dataToLoad = { foo: 'bar' };

      localStorage.getItem.mockReturnValueOnce(JSON.stringify(dataToLoad));

      expect(LocalStorage.load('foo')).toEqual(dataToLoad);
      expect(localStorage.getItem).toHaveBeenCalledWith('foo');
    });

    it('should returns null if value not exist', () => {
      localStorage.getItem.mockReturnValueOnce(undefined);

      expect(LocalStorage.load('foo')).toEqual(null);
      expect(localStorage.getItem).toHaveBeenCalledWith('foo');
    });
  });
});
