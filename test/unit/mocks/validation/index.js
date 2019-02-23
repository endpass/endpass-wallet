import { Validator } from 'vee-validate';

Validator.extend('seed_phrase', {
  validate: jest.fn(() => ({
    valid: true,
  })),
});
