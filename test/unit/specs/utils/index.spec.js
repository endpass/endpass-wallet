import * as utils from '@/utils';
import store from '@/store';

jest.mock('@/store', () => ({
  state: {
    module: {
      field: null,
    },
  },
  watch: jest.fn((getValue, callback) => {
    setTimeout(() => callback('new value'));
    return () => {};
  }),
}));

describe('kebabToCamel', () => {
  it('should replace kebab notation to camel notation', () => {
    const received = 'replace-to-camel-notation';
    const expected = 'replaceToCamelNotation';

    expect(utils.kebabToCamel(received)).toBe(expected);
  });

  it('should not do anything', () => {
    let text = 'textInCamelNotation';

    expect(utils.kebabToCamel(text)).toBe(text);

    text = 'oneword';

    expect(utils.kebabToCamel(text)).toBe(text);
    ``;
  });
});

describe('getInitializedValueFromStore', () => {
  const value = 'value';
  const { module } = store.state;

  it('should return already initialized value', async () => {
    module.field = value;

    const receivedValue = await utils.getInitializedValueFromStore(
      module,
      'field',
    );

    expect(receivedValue).toBe(value);
  });

  it('should return just initialized value', async () => {
    module.field = null;

    const receivedValue = await utils.getInitializedValueFromStore(
      module,
      'field',
    );

    expect(receivedValue).toBe('new value');
  });
});
