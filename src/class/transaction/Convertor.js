import { isAddress, toChecksumAddress } from 'web3-utils';

const DEFAULT_STRING_INT = '0';

const basicMatches = {
  int: /^\d+$/,
  float: /[-+]?[0-9]*\.?[0-9]*/,
  hex: /0[xX][0-9a-fA-F]+/,
};

const intMatcher = value => basicMatches.int.test(value);
const intFloat = value => basicMatches.float.test(value);
const intHex = value => basicMatches.hex.test(value);

const checkUntilValid = (...rules) => value =>
  rules.reduce((res, nextRule) => res || nextRule(value), false);

const isStringifierFloat = checkUntilValid(intFloat, intMatcher, intHex);

function getValue(checkVal, matcher) {
  if (matcher(checkVal)) return checkVal;

  console.error('String conversion error. Please check input parameters');
  return DEFAULT_STRING_INT;
}

export default class Convertor {
  /**
   * Convert Int, Float or Hex value to string in float format
   * val -> int, float, hex(0x<16>)
   * @function
   * @param {String | Integer} val - Int, Float or Hex to convert
   * @returns {String} In float format
   */
  static toStringFloat(val) {
    const checkVal = String(val);
    return getValue(checkVal, isStringifierFloat);
  }

  /**
   * Convert address to correct checksum address or return as is
   * @function
   * @param {String} addr - address value for convert
   * @returns {String} In address format or as is
   */
  static toAddress(addr) {
    // TODO help process to undefined?
    return isAddress(addr) ? toChecksumAddress(addr) : addr;
  }
}
