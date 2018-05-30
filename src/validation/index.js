import Vue from 'vue'
import { default as VeeValidate, Validator } from 'vee-validate';
import address from './address';
import privateKey from './privateKey';
import publicKey from './publicKey';

Validator.extend('address', address);
Validator.extend('private_key', privateKey);
Validator.extend('public_key', publicKey);

Vue.use(VeeValidate);
