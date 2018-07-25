const identityAPIUrl = '/identity/api/v1';
const tokenInfoAPIUrl = '/tokeninfo/api/v1';

// Parameters for cipher encrypting wallet
const kdfParams = {
  kdf: 'scrypt',
  n: 1024, // low for development
};

export default {
  identityAPIUrl,
  tokenInfoAPIUrl,
  kdfParams,
};
