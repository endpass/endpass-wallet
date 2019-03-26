const prod = require('./prod.env');
const dev = require('./dev.env');
const test = require('./test.env');
const localDev = require('./dev.local.env');

let local;

try {
  local = require('./local.env');
} catch (e) {
  local = localDev;
}

const map = {
  production: prod,
  development: dev,
  test,
  default: local || dev,
};
const getEnv = (env, isLocal) => {
  if (isLocal) {
    return map.default;
  }
  const key = (env || '').toLowerCase() || 'default';
  return map[key];
};

module.exports = getEnv;
