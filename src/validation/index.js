import Vue from 'vue'
import { default as VeeValidate, Validator } from 'vee-validate';
import address from './address';
import privateKey from './privateKey';

Validator.extend('address', address);
Validator.extend('private_key', privateKey);

Vue.use(VeeValidate);
