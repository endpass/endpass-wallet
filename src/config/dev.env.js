const identityAPIUrl = '/identity/api/v1';
const tokenImageUrl = 'https://tokeninfo-dev.endpass.com';
const tokenInfoAPIUrl = '/tokeninfo/api/v1';
const cryptoDataAPIUrl = '/gasprice/api/v1';

const intercomAppId = 'o0u2wypb';

// Parameters for cipher encrypting wallet
const kdfParams = {
  kdf: 'scrypt',
  n: 1024, // low for development
};

export default {
  cryptoDataAPIUrl,
  identityAPIUrl,
  tokenImageUrl,
  tokenInfoAPIUrl,
  kdfParams,
  intercomAppId,
};
