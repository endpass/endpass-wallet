import web3 from 'web3';
export default {
  getMessage(field, params, data) {
      return (data && data.message) || 'Something went wrong';
  },
  validate(value, args) {
    const zeroAddressRegex = /^0x0+$/;
    const isKey = web3.utils.isAddress(value);
    const isZeroKey = value.match(zeroAddressRegex);
    const message = isZeroKey ? 'This is a zero address' : 'This is not a valid address';
    return {
      valid: isKey && !isZeroKey,
      data: !isKey || isZeroKey ? { message } : undefined
    }
  }
}
