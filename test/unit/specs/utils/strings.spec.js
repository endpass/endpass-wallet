import { getShortStringWithEllipsis, matchString } from '@/utils/strings';

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

describe('matchString', () => {
  it('should correctly match substrings in strings', () => {
    expect(matchString('HELLO world', 'hello')).toBe(true);
    expect(matchString('hello world', 'WORLD')).toBe(true);
    expect(matchString('HELLO world', 'goodbye')).toBe(false);
    expect(matchString('HELLO world', 'ell')).toBe(true);
  });
});
