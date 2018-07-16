import ethUtils from 'ethereumjs-util';
export default {
  getMessage(field, params, data) {
    return (data && data.message) || 'Something went wrong';
  },
  validate(value, args) {
    let isKey;
    try {
      isKey = ethUtils.isValidPrivate(
        Buffer.from(value.replace(/^0x/, ''), 'hex'),
      );
    } catch (e) {
      return {
        valid: false,
        data: { message: e.message },
      };
    }
    return {
      valid: isKey,
      data: !isKey ? { message: 'This is not a valid private key' } : undefined,
    };
  },
};
