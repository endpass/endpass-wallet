const identityAPIUrl = '/identity/api/v1';
const tokenImageUrl = 'https://tokeninfo-dev.endpass.com';
const tokenInfoAPIUrl = '/tokeninfo/api/v1';
const cryptoDataAPIUrl = '/gasprice/api/v1';
const allowedDomain = 'http://localhost:8080';

// Parameters for cipher encrypting wallet
const kdfParams = {
  kdf: 'scrypt',
  n: 1024, // low for development
};

export default {
  allowedDomain,
  cryptoDataAPIUrl,
  identityAPIUrl,
  tokenImageUrl,
  tokenInfoAPIUrl,
  kdfParams,
};
