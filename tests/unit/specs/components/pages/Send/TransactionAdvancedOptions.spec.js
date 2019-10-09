import VeeValidate, { Validator } from 'vee-validate';
import { createLocalVue } from '@vue/test-utils';
import UIComponents from '@endpass/ui';
import { transaction } from 'fixtures/transactions';
import validation from '@/validation';
import { wrapShallowMountFactory } from '@/testUtils';

import TransactionAdvancedOptions from '@/components/pages/Send/TransactionAdvancedOptions.vue';

import setupI18n from '@/locales/i18nSetup';

Validator.extend('hex', () => true);

const localVue = createLocalVue();
const i18n = setupI18n(localVue);

localVue.use(VeeValidate);
localVue.use(validation);
localVue.use(UIComponents);

describe('Send – TransactionAdvancedOptions', () => {
  const mountProps = {
    transaction,
  };
  let wrapper;
  let wrapperFactory;

  beforeEach(() => {
    jest.clearAllMocks();
    wrapperFactory = wrapShallowMountFactory(TransactionAdvancedOptions, {
      i18n,
      propsData: mountProps,
      provide: () => ({
        $validator: new VeeValidate.Validator(),
      }),
      localVue,
      sync: false,
    });
    wrapper = wrapperFactory();
  });

  describe('render', () => {
    it('should render with data input if current token is not passed', () => {
      expect(
        wrapper.find('.field.is-horizontal:last-child').html(),
      ).toMatchSnapshot();
    });

    it('should render without data input if current token is passed', () => {
      wrapper.setProps({
        currentToken: {},
      });

      expect(
        wrapper.find('.field.is-horizontal:last-child').html(),
      ).toMatchSnapshot();
    });
  });

  describe('behavior', () => {
    it('should get props from given transaction and set it to form', () => {
      expect(wrapper.vm.form).toEqual({
        gasPrice: '40',
        gasLimit: '22000',
        nonce: 0,
        data: '0x',
      });
    });

    describe('method', () => {
      describe('toggle', () => {
        it('should toggle options', () => {
          wrapper.vm.toggle();

          expect(wrapper.vm.isCollapsed).toBe(false);

          wrapper.vm.toggle();

          expect(wrapper.vm.isCollapsed).toBe(true);
        });
      });
    });

    describe('watchers', () => {
      it('should update gas price in form if transaction gas price changed', () => {
        wrapper = wrapperFactory({
          propsData: {
            transaction: {
              gasPrice: 999,
            },
          },
        });

        expect(wrapper.vm.form.gasPrice).toBe(999);
      });

      it('should update nonce in form if transaction nonce changed', () => {
        wrapper = wrapperFactory({
          propsData: {
            transaction: {
              nonce: 999,
            },
          },
        });

        expect(wrapper.vm.form.nonce).toBe(999);
      });

      it('should update form nonce if next nonce in block is greater', async () => {
        expect.assertions(1);

        wrapper.setData({
          form: {
            nonce: 10,
          },
        });
        wrapper.setData({
          nextNonceInBlock: 15,
        });

        await wrapper.vm.$nextTick();

        expect(wrapper.vm.form.nonce).toBe(15);
      });

      it('should unfold options if isOpened truthy', () => {
        wrapper = wrapperFactory({
          propsData: {
            transaction: {},
            isOpened: true,
          },
        });

        expect(wrapper.vm.isCollapsed).toBe(false);
      });
    });
  });
});
