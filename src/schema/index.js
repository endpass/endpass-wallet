import { ajv } from '@/class/singleton';

export { default as gasPrice } from './gasPrice';

export const validate = (validator, data) => {
  const validData = Array.isArray(data) ? [...data] : { ...data };

  if (!validator(validData)) {
    throw new Error(ajv.errorsText(validator));
  }

  return validData;
};

export default {
  validate,
};
