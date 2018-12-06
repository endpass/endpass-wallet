import { ajv } from '@/class/singleton';
import * as cryptoDataSchemas from './cryptoData';

const makeValidator = schema => {
  const validator = ajv.compile(schema);

  return data => {
    if (!validator(data)) {
      throw new Error(ajv.errorsText(validator));
    }

    return data;
  };
};

export const cryptoDataValidator = {
  validateGasPrice: makeValidator(cryptoDataSchemas.gasPrice),
  validateSymbolPrice: makeValidator(cryptoDataSchemas.symbolPrice),
  validateSymbolsPrice: makeValidator(cryptoDataSchemas.symbolsPrice),
};
