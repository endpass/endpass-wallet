import { ajv } from '@/class/singleton';

export { default as cryptoData } from './cryptoData';

export const validate = (validator, data) => {
  if (!validator(data)) {
    throw new Error(ajv.errorsText(validator));
  }

  return data;
};

export default {
  validate,
};
