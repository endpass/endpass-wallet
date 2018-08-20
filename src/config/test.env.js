const identityAPIUrl = 'https://identity-dev.endpass.com/api/v1';
const tokenImageUrl = 'https://tokeninfo-dev.endpass.com';
const tokenInfoAPIUrl = 'https://tokeninfo-dev.endpass.com/api/v1';
const cryptoDataAPIUrl = 'https://cryptodata-dev.endpass.com/api/v1';
const allowedDomain = 'https://wallet-dev.endpass.com';

const kdfParams = {
  kdf: 'scrypt',
  n: 4,
};

export default {
  allowedDomain,
  identityAPIUrl,
  tokenImageUrl,
  tokenInfoAPIUrl,
  cryptoDataAPIUrl,
  kdfParams,
};
