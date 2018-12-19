import Ajv from 'ajv';

export default new Ajv({
  useDefaults: true,
  allErrors: true,
});
