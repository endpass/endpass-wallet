export default {
  getMessage(field, params, data) {
      return (data && data.message) || 'Something went wrong';
  },
  validate(value, args) {
    const hexRegex = /^(0x|0X)([a-fA-F0-9]+)?$/;
    const isHex = !!value.match(hexRegex);
    const message = 'This is not a valid hex';
    return {
      valid: isHex,
      data: !isHex ? { message } : undefined
    }
  }
}
