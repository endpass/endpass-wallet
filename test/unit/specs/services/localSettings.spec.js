import LocalStorage from '@/class/storage/LocalStorage';

const localSettings = require.requireActual('@/services/localSettings').default;

describe('localSettings', () => {
  describe('save', () => {
    it('should call the same storage method on save', () => {
      const dataToSave = {
        activeAccount: 'bar',
      };

      localSettings.save(dataToSave);

      expect(LocalStorage.save).toHaveBeenCalledWith(
        expect.any(String),
        dataToSave,
      );
    });

    it('should pick only allowed props from payload (activeAccount)', () => {
      localSettings.save({
        foo: 'bar',
        activeAccount: 'baz',
      });

      expect(LocalStorage.save).toHaveBeenCalledWith(expect.any(String), {
        activeAccount: 'baz',
      });
    });
  });

  describe('load', () => {
    it('should call the same storage method on load', () => {
      localSettings.load();

      expect(LocalStorage.load).toHaveBeenCalledWith(expect.any(String));
    });
  });

  describe('clear', () => {
    it('should call remove storage method on clear', () => {
      localSettings.clear();

      expect(LocalStorage.remove).toHaveBeenCalledWith(expect.any(String));
    });
  });
});
