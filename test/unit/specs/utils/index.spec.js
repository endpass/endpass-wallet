import * as utils from '@/utils';

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
