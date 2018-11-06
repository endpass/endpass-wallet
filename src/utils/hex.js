export const stripHexPrefix = hex => hex.replace(/^0x/, '');

export const hexToMsg = hex => {
  try {
    return Buffer.from(stripHexPrefix(hex), 'hex').toString('utf8');
  } catch (err) {
    return hex;
  }
};

export default {
  stripHexPrefix,
  hexToMsg,
};
