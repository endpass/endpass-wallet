import Vue from 'vue'
import { default as VeeValidate, Validator } from 'vee-validate';
import address from './address';
import privateKey from './privateKey';
import seedPhrase from './seedPhrase';

Validator.extend('address', address);
Validator.extend('private_key', privateKey);
Validator.extend('seed_phrase', seedPhrase);

Vue.use(VeeValidate);
