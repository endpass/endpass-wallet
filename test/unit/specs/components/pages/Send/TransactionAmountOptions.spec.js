import VeeValidate from 'vee-validate';
import { shallow, createLocalVue } from '@vue/test-utils';
import { generateStubs } from '@/utils/testUtils';
import { token } from 'fixtures/tokens';
import TransactionAmountOptions from '@/components/pages/Send/TransactionAmountOptions.vue';

const localVue = createLocalVue();

localVue.use(VeeValidate);

describe('Send – TransactionAmountOptions', () => {
  const mountProps = {
    value: 1,
    ethPrice: 100,
    fiatCurrency: 'USD',
    activeNet: {
      id: 1,
    },
    currentToken: {
      ...token,
      price: {
        ETH: 1,
      },
    },
  };
  let wrapper;

  beforeEach(() => {
    jest.clearAllMocks();

    wrapper = shallow(TransactionAmountOptions, {
      stubs: generateStubs(TransactionAmountOptions),
      propsData: mountProps,
      provide: () => ({
        $validator: new VeeValidate.Validator(),
      }),
      localVue,
    });
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
          jest.spyOn(wrapper.vm, 'emitInputValue');

          wrapper.setComputed({
            maxAmount: 100,
          });
          wrapper.vm.setMaxAmount();

          expect(wrapper.vm.emitInputValue).toBeCalledWith(100);
          expect(wrapper.emitted().input).toBeTruthy();
        });

        it('should not do anything if disabled prop is truthy', () => {
          wrapper = shallow(TransactionAmountOptions, {
            stubs: generateStubs(TransactionAmountOptions),
            provide: () => ({
              $validator: new VeeValidate.Validator(),
            }),
            propsData: {
              ...mountProps,
              disabled: true,
            },
            localVue,
          });

          jest.spyOn(wrapper.vm, 'emitInputValue');

          wrapper.vm.setMaxAmount();

          expect(wrapper.vm.emitInputValue).not.toBeCalled();
          expect(wrapper.emitted().input).toBeFalsy();
        });
      });

      describe('getAmountFromPrice', () => {
        beforeEach(() => {
          wrapper = shallow(TransactionAmountOptions, {
            stubs: generateStubs(TransactionAmountOptions),
            propsData: mountProps,
            provide: () => ({
              $validator: new VeeValidate.Validator(),
            }),
            data: {
              price: 200,
            },
            localVue,
          });
          jest.spyOn(wrapper.vm, 'emitInputValue');
        });

        it('should correctly transform price to amount with token and emit result', () => {
          wrapper.vm.getAmountFromPrice();

          expect(wrapper.vm.emitInputValue).toHaveBeenLastCalledWith(
            '2.00000000',
          );
          expect(wrapper.emitted().input).toBeTruthy();
        });

        it('should correctly transform price to amount without token and emit result', () => {
          wrapper = shallow(TransactionAmountOptions, {
            stubs: generateStubs(TransactionAmountOptions),
            propsData: {
              ...mountProps,
              currentToken: null,
            },
            provide: () => ({
              $validator: new VeeValidate.Validator(),
            }),
            data: {
              price: 200,
            },
            localVue,
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
          wrapper.setProps({
            value: 2,
          });
          wrapper.vm.getPriceFromAmount();

          expect(wrapper.vm.price).toBe('200.00');
        });

        it('should correctly change price without current token', () => {
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
          wrapper.vm.handlePriceInput(10);

          expect(wrapper.vm.price).toBe(10);
          expect(wrapper.vm.lastChangedPriceType).toBe('price');
        });
      });

      describe('handleChangeBalanceAndEstimatedGasCost', () => {
        beforeEach(() => {
          wrapper = shallow(TransactionAmountOptions, {
            stubs: generateStubs(TransactionAmountOptions),
            provide: () => ({
              $validator: new VeeValidate.Validator(),
            }),
            propsData: {
              ...mountProps,
              balance: 10,
              estimatedGasCost: 20,
            },
            localVue,
          });
        });

        it('should add error if estimated gas cost greater than balance', () => {
          wrapper.vm.handleChangeBalanceAndEstimatedGasCost();

          expect(wrapper.vm.errors.has('value')).toBe(true);
        });

        it('should remove error if estimated gas cost lower than balance', () => {
          wrapper.setProps({
            balance: 20,
            estimatedGasCost: 10,
          });

          wrapper.vm.handleChangeBalanceAndEstimatedGasCost();

          expect(wrapper.vm.errors.has('value')).toBe(false);
        });
      });
    });

    describe('watchers', () => {
      it('should reset amount on token change', () => {
        jest.spyOn(wrapper.vm, 'resetAmountOptions');

        wrapper.setProps({
          currentToken: 'foo',
        });

        expect(wrapper.vm.resetAmountOptions).toBeCalledTimes(1);
      });

      it('should emit tokens change on network change', () => {
        jest.spyOn(wrapper.vm, 'emitChangeTokenInfo');

        wrapper.setProps({
          activeNet: {
            id: 2,
          },
        });

        expect(wrapper.vm.emitChangeTokenInfo).toBeCalledTimes(1);
      });

      it('should get price from amount if last price type is amount and value changed', () => {
        jest.spyOn(wrapper.vm, 'getPriceFromAmount');

        wrapper.setData({
          lastChangedPriceType: 'amount',
        });
        wrapper.setProps({
          value: 100,
        });

        expect(wrapper.vm.getPriceFromAmount).toBeCalledTimes(1);
      });

      it('should not get price from amount if value changed and last price type is not amount', () => {
        jest.spyOn(wrapper.vm, 'getPriceFromAmount');

        wrapper.setData({
          lastChangedPriceType: 'price',
        });
        wrapper.setProps({
          value: 100,
        });

        expect(wrapper.vm.getPriceFromAmount).not.toBeCalled();
      });

      it('should get amout from price if last price type is price and price changed', async () => {
        jest.spyOn(wrapper.vm, 'getAmountFromPrice');

        wrapper.vm.handlePriceInput(999);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.getAmountFromPrice).toBeCalledTimes(1);
      });

      it('should not get amout from price if price changed and last price type is not price', async () => {
        jest.spyOn(wrapper.vm, 'getAmountFromPrice');

        wrapper.setData({
          lastChangedPriceType: 'amount',
          price: 100,
        });
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.getAmountFromPrice).not.toBeCalled();
      });

      it('should handle balance changes', () => {
        jest.spyOn(wrapper.vm, 'handleChangeBalanceAndEstimatedGasCost');

        wrapper.setProps({
          balance: 999,
        });

        expect(
          wrapper.vm.handleChangeBalanceAndEstimatedGasCost,
        ).toBeCalledTimes(1);
      });

      it('should handle gas cost changes', () => {
        jest.spyOn(wrapper.vm, 'handleChangeBalanceAndEstimatedGasCost');

        wrapper.setProps({
          estimatedGasCost: 999,
        });

        expect(
          wrapper.vm.handleChangeBalanceAndEstimatedGasCost,
        ).toBeCalledTimes(1);
      });
    });
  });
});
