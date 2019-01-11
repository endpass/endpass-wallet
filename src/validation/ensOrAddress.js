import { isAddress } from 'web3-utils';

export default {
  getMessage(field, params, data) {
    return (data && data.message) || 'Something went wrong';
  },
  validate(value) {
    const zeroAddressRegex = /^0x0+$/;
    const isHashKey = isAddress(value) || value.match(/^.+\.(eth|etc|test)$/);
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
