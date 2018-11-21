import { ajv } from '@/class/singleton';

export { default as gasPrice } from './gasPrice';

export const validate = (validator, data) => {
  if (!validator(data)) {
    throw new Error(ajv.errorsText(validator));
  }

  return data;
};

export default {
  validate,
};
