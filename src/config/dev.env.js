const userAPIUrl = 'http://user-url-for-dev.com';

// Parameters for cipher encrypting wallet
const kdfParams = {
  kdf: 'scrypt',
  n: 1024, // low for development
}

export default {
  userAPIUrl,
  kdfParams,
};
