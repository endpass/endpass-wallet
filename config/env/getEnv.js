const prod = require('./prod.env');
const dev = require('./dev.env');
const test = require('./test.env');

let local;
try {
  local = require('./local.env');
} catch (e) {}

const map = {
  production: prod,
  development: dev,
  test,
  default: local || dev,
};
const getEnv = env => {
  const key = (env || '').toLowerCase() || 'default';
  return map[key];
};

module.exports = getEnv;
