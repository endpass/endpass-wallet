import { upperFirst } from 'lodash';
import { ajv } from '@/class';
import * as cryptoDataSchemas from './cryptoData';
import * as v3KeystoreSchemas from './v3Keystore';
import * as identitySchemas from './identity';

const makeValidator = schema => {
  const validator = ajv.compile(schema);

  return (data, isOnlyLog = ENV.isProduction) => {
    if (!validator(data)) {
      console.warn('Schema validation error', data);

      if (!isOnlyLog) {
        throw new Error(ajv.errorsText(validator));
      }
    }

    return data;
  };
};

const makeValidators = schemas =>
  Object.keys(schemas).reduce(
    (acc, key) =>
      Object.assign(acc, {
        [`validate${upperFirst(key)}`]: makeValidator(schemas[key]),
      }),
    {},
  );

export const cryptoDataValidator = makeValidators(cryptoDataSchemas);

export const v3KeystoreValidator = makeValidators(v3KeystoreSchemas);

export const identityValidator = makeValidators(identitySchemas);
