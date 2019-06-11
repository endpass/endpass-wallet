import keystoreKeyVerify from '@endpass/utils/keystoreKeyVerify';

export default {
  getMessage(field, params, data) {
    return (data && data.message) || 'Something went wrong';
  },
  validate(value) {
    let isKey;
    try {
      isKey = keystoreKeyVerify.verifyPublicKey(value);
    } catch (e) {
      return {
        valid: false,
        data: { message: e.message },
      };
    }
    return {
      valid: isKey,
      data: !isKey ? { message: 'This is not a valid public key' } : undefined,
    };
  },
};
