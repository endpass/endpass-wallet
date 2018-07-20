import Vue from 'vue';
import { default as VeeValidate, Validator } from 'vee-validate';
import address from './address';
import privateKey from './privateKey';
import ensAddress from './ensAddress';
import publicKey from './publicKey';
import seedPhrase from './seedPhrase';
import hex from './hex';

Validator.extend('address', address);
Validator.extend('ensAddress', ensAddress);
Validator.extend('private_key', privateKey);
Validator.extend('public_key', publicKey);
Validator.extend('seed_phrase', seedPhrase);
Validator.extend('hex', hex);

Vue.use(VeeValidate);
