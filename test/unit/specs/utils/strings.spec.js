import {
  getShortStringWithEllipsis,
  toKebab,
  toCamel,
  toWords,
  matchString,
} from '@/utils/strings';

describe('getShortStringWithEllipsis', () => {
  it('should returns first and last 4 symbols divided by ellipsis by default', () => {
    expect(
      getShortStringWithEllipsis('0x3e222233334444555566667777888899990000'),
    ).toEqual('0x3e...0000');
  });

  it('should returns first and last 6 symbols divided by ellipsis', () => {
    expect(
      getShortStringWithEllipsis('0x3e222233334444555566667777888899990000', 6),
    ).toEqual('0x3e22...990000');
  });
});

describe('toWords', () => {
  it('should split any string to words array', () => {
    const strings = [
      'Need to split by words',
      'need-to-split-by-words',
      'needToSplitByWords',
      'need_to_split_by_words',
      'NeedTo split-by words',
    ];

    strings.forEach(string => {
      expect(toWords(string)).toEqual(['need', 'to', 'split', 'by', 'words']);
    });
  });
});

describe('toCamel', () => {
  it('should change string to camel case', () => {
    const strings = [
      'not-in-camel-case',
      'not_in_camel_case',
      'NotInCamelCase',
      'not in camel case',
      'notInCamelCase',
      'not-InCamel-case',
    ];

    strings.forEach(string => {
      expect(toCamel(string)).toEqual('notInCamelCase');
    });
  });
});

describe('toKebab', () => {
  it('should change string to kebab case', () => {
    const strings = [
      'not-in-kebab-case',
      'not_in_kebab_case',
      'NotInKebabCase',
      'not in kebab case',
      'notInKebabCase',
      'not-InKebab-case',
    ];

    strings.forEach(string => {
      expect(toKebab(string)).toEqual('not-in-kebab-case');
    });
  });
});

describe('matchString', () => {
  it('should correctly match substrings in strings', () => {
    expect(matchString('HELLO world', 'hello')).toBe(true);
    expect(matchString('hello world', 'WORLD')).toBe(true);
    expect(matchString('HELLO world', 'goodbye')).toBe(false);
    expect(matchString('HELLO world', 'ell')).toBe(true);
  });
});
