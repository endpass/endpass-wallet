const merge = require('webpack-merge');
const prodEnv = require('./prod.env');

const identityAPIUrl = '/identity/api/v1.1';
const tokenImageUrl = 'https://tokeninfo-dev.endpass.com';
const tokenInfoAPIUrl = '/tokeninfo/api/v1';
const cryptoDataAPIUrl = '/cryptodata/api/v1';
const wildproxyUrl = '/';

const intercomAppId = 'o0u2wypb';

// Parameters for cipher encrypting wallet
const kdfParams = {
  kdf: 'scrypt',
  n: 1024, // low for development
};

const isProduction = false;

module.exports = merge(prodEnv, {
  cryptoDataAPIUrl,
  identityAPIUrl,
  tokenImageUrl,
  wildproxyUrl,
  tokenInfoAPIUrl,
  kdfParams,
  intercomAppId,
  isProduction,
});
