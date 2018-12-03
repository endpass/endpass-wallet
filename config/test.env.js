const merge = require('webpack-merge');
const prodEnv = require('./prod.env');

const identityAPIUrl = 'https://identity-dev.endpass.com/api/v1.1';
const tokenImageUrl = 'https://tokeninfo-dev.endpass.com';
const tokenInfoAPIUrl = 'https://tokeninfo-dev.endpass.com/api/v1';
const cryptoDataAPIUrl = 'https://cryptodata-dev.endpass.com/api/v1';

const kdfParams = {
  kdf: 'scrypt',
  n: 4,
};
const isProduction = false;

module.exports = merge(prodEnv, {
  identityAPIUrl,
  tokenImageUrl,
  tokenInfoAPIUrl,
  cryptoDataAPIUrl,
  kdfParams,
  isProduction,
});
