export default {
  getMessage(field, params, data) {
    return (data && data.message) || 'Something went wrong';
  },
  validate(value) {
    let isSeed;
    try {
      isSeed = value.trim().split(/\s+/g).length >= 12;
    } catch (e) {
      return {
        valid: false,
        data: { message: e.message },
      };
    }
    return {
      valid: isSeed,
      data: !isSeed
        ? { message: 'This is not a valid seed phrase' }
        : undefined,
    };
  },
};
