import web3 from 'web3';

export default {
  getMessage(field, params, data) {
    return (data && data.message) || 'Something went wrong';
  },
  validate(value) {
    const zeroAddressRegex = /^0x0+$/;
    const isHashKey =
      web3.utils.isAddress(value) || value.match(/^.+\.(eth|etc)$/);
    const isZeroKey = value.match(zeroAddressRegex);
    const message = isZeroKey
      ? 'This is a zero address'
      : 'This is not a valid address';

    return {
      valid: isHashKey && !isZeroKey,
      data: !isHashKey || isZeroKey ? { message } : undefined,
    };
  },
};
