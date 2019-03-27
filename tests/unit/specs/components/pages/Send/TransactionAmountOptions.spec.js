import VeeValidate from 'vee-validate';
import { toWei } from 'web3-utils';
import { createLocalVue } from '@vue/test-utils';
import UIComponents from '@endpass/ui';
import validation from '@/validation';
import { wrapShallowMountFactory } from '@/testUtils';
import TransactionAmountOptions from '@/components/pages/Send/TransactionAmountOptions.vue';
import { token } from 'fixtures/tokens';

const localVue = createLocalVue();

localVue.use(validation);
localVue.use(VeeValidate);
localVue.use(UIComponents);

describe('Send – TransactionAmountOptions', () => {
  const mountProps = {
    value: 1,
    ethPrice: 100,
    fiatCurrency: 'USD',
    activeNet: {
      id: 1,
    },
    currentToken: token,
  };
  let wrapper;
  let wrapperFactory;

  beforeEach(async () => {
    jest.clearAllMocks();
    wrapperFactory = wrapShallowMountFactory(TransactionAmountOptions, {
      propsData: mountProps,
      provide: () => ({
        $validator: new VeeValidate.Validator(),
      }),
      localVue,
      sync: false,
    });
    wrapper = wrapperFactory();

    // TODO: hack solution for [https://github.com/vuejs/vue-test-utils/issues/761]
    await wrapper.vm.$nextTick();
    wrapper.setProps({
      currentToken: 'less',
    });
    await wrapper.vm.$nextTick();
  });

  describe('behavior', () => {
    describe('methods', () => {
      describe('resetAmountOptions', () => {
        it('should set price to 0 and emit zero value', () => {
          jest.spyOn(wrapper.vm, 'emitInputValue');

          wrapper.vm.resetAmountOptions();

          expect(wrapper.vm.price).toBe(0);
          expect(wrapper.vm.emitInputValue).toBeCalledWith(0);
          expect(wrapper.emitted().input).toBeTruthy();
        });
      });

      describe('setMaxAmount', () => {
        it('should emit input equals to max amount if disabled prop is falsy', () => {
          wrapper = wrapperFactory({
            computed: {
              maxAmount: 100,
            },
          });

          jest.spyOn(wrapper.vm, 'emitInputValue');

          wrapper.vm.setMaxAmount();

          expect(wrapper.vm.emitInputValue).toBeCalledWith(100);
          expect(wrapper.emitted().input).toBeTruthy();
        });

        it('should not do anything if disabled prop is truthy', () => {
          wrapper = wrapperFactory({
            propsData: {
              ...mountProps,
              disabled: true,
            },
          });

          jest.spyOn(wrapper.vm, 'emitInputValue');

          wrapper.vm.setMaxAmount();

          expect(wrapper.vm.emitInputValue).not.toBeCalled();
          expect(wrapper.emitted().input).toBeFalsy();
        });
      });

      describe('getAmountFromPrice', () => {
        beforeEach(() => {
          wrapper = wrapperFactory({
            propsData: mountProps,
            data: () => ({
              price: 200,
            }),
          });

          jest.spyOn(wrapper.vm, 'emitInputValue');
        });

        it('should correctly transform price to amount with token and emit result', () => {
          wrapper.vm.getAmountFromPrice();

          expect(wrapper.vm.emitInputValue).toHaveBeenLastCalledWith(
            '200.00000000',
          );
          expect(wrapper.emitted().input).toBeTruthy();
        });

        it('should correctly transform price to amount without token and emit result', () => {
          wrapper = wrapperFactory({
            propsData: {
              ...mountProps,
              currentToken: null,
            },
            data: () => ({
              price: 200,
            }),
          });

          jest.spyOn(wrapper.vm, 'emitInputValue');

          wrapper.vm.getAmountFromPrice();

          expect(wrapper.vm.emitInputValue).toHaveBeenLastCalledWith(
            '2.000000000000000000',
          );
          expect(wrapper.emitted().input).toBeTruthy();
        });
      });

      describe('getPriceFromAmount', () => {
        it('should correctly change price with current token', () => {
          wrapper = wrapperFactory();
          wrapper.setProps({
            value: 2,
          });
          wrapper.vm.getPriceFromAmount();

          expect(wrapper.vm.price).toBe('2.00');
        });

        it('should correctly change price without current token', () => {
          wrapper = wrapperFactory();
          wrapper.setProps({
            value: 5,
            currentToken: null,
          });
          wrapper.vm.getPriceFromAmount();

          expect(wrapper.vm.price).toBe('500.00');
        });
      });

      describe('handleAmountInput', () => {
        it('should emit input and change last price type to amount', () => {
          jest.spyOn(wrapper.vm, 'emitInputValue');

          wrapper.vm.handleAmountInput(10);

          expect(wrapper.vm.emitInputValue).toHaveBeenLastCalledWith(10);
          expect(wrapper.emitted().input).toBeTruthy();
          expect(wrapper.vm.lastChangedPriceType).toBe('amount');
        });
      });

      describe('handlePriceInput', () => {
        it('should set price and change last price type to price', () => {
          wrapper = wrapperFactory();
          wrapper.vm.handlePriceInput(10);

          expect(wrapper.vm.price).toBe(10);
          expect(wrapper.vm.lastChangedPriceType).toBe('price');
        });
      });

      describe('handleChangeBalanceAndGasFee', () => {
        beforeEach(() => {
          wrapper = wrapperFactory({
            propsData: {
              ...mountProps,
              currentToken: null,
              balance: toWei('1', 'gwei'),
              gasPrice: '60',
              gasLimit: '400000',
            },
          });
        });

        it('should add error if estimated gas fee greater than balance', () => {
          wrapper.vm.handleChangeBalanceAndGasFee();

          expect(wrapper.vm.errors.has('value')).toBe(true);
        });

        it('should remove error if estimated gas fee lower than balance', () => {
          wrapper = wrapperFactory({
            propsData: {
              ...mountProps,
              currentToken: null,
              balance: toWei('1', 'ether'),
              gasPrice: '1',
              gasLimit: '21000',
            },
          });

          wrapper.vm.handleChangeBalanceAndGasFee();

          expect(wrapper.vm.errors.has('value')).toBe(false);
        });
      });
    });

    describe('watchers', () => {
      it('should reset amount on token change', async () => {
        expect.assertions(1);

        jest.spyOn(wrapper.vm, 'resetAmountOptions');

        wrapper.setProps({
          currentToken: 'foo',
        });

        await wrapper.vm.$nextTick();

        expect(wrapper.vm.resetAmountOptions).toBeCalledTimes(1);
      });

      it('should emit tokens change on network change', async () => {
        expect.assertions(1);

        jest.spyOn(wrapper.vm, 'emitChangeTokenInfo');

        wrapper.setProps({
          activeNet: {
            id: 2,
          },
        });

        await wrapper.vm.$nextTick();

        expect(wrapper.vm.emitChangeTokenInfo).toBeCalledTimes(1);
      });

      it('should get price from amount if last price type is amount and value changed', async () => {
        expect.assertions(1);

        jest.spyOn(wrapper.vm, 'getPriceFromAmount');

        wrapper.setData({
          lastChangedPriceType: 'amount',
        });
        wrapper.setProps({
          value: 100,
        });

        await wrapper.vm.$nextTick();

        expect(wrapper.vm.getPriceFromAmount).toBeCalledTimes(1);
      });

      it('should not get price from amount if value changed and last price type is not amount', async () => {
        expect.assertions(1);

        jest.spyOn(wrapper.vm, 'getPriceFromAmount');

        wrapper.setData({
          lastChangedPriceType: 'price',
        });
        wrapper.setProps({
          value: 100,
        });

        await wrapper.vm.$nextTick();

        expect(wrapper.vm.getPriceFromAmount).not.toBeCalled();
      });

      it('should get amout from price if last price type is price and price changed', async () => {
        expect.assertions(1);

        jest.spyOn(wrapper.vm, 'getAmountFromPrice');

        wrapper.vm.handlePriceInput(999);

        await wrapper.vm.$nextTick();

        expect(wrapper.vm.getAmountFromPrice).toBeCalledTimes(1);
      });

      it('should not get amout from price if price changed and last price type is not price', async () => {
        expect.assertions(1);

        jest.spyOn(wrapper.vm, 'getAmountFromPrice');

        wrapper.setData({
          lastChangedPriceType: 'amount',
          price: 100,
        });

        await wrapper.vm.$nextTick();

        expect(wrapper.vm.getAmountFromPrice).not.toBeCalled();
      });

      it('should handle balance changes', async () => {
        expect.assertions(1);

        jest.spyOn(wrapper.vm, 'handleChangeBalanceAndGasFee');

        wrapper.setProps({
          balance: 999,
        });

        await wrapper.vm.$nextTick();

        expect(wrapper.vm.handleChangeBalanceAndGasFee).toBeCalledTimes(1);
      });

      it('should handle gas fee changes', async () => {
        expect.assertions(1);

        jest.spyOn(wrapper.vm, 'handleChangeBalanceAndGasFee');

        wrapper.setProps({
          gasPrice: '40',
          gasLimit: '40000',
        });

        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.handleChangeBalanceAndGasFee).toBeCalledTimes(1);
      });
    });
  });
});
