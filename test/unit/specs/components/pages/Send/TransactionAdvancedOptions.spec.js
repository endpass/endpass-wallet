import VeeValidate from 'vee-validate';
import { shallow, createLocalVue } from '@vue/test-utils';
import { generateStubs } from '@/utils/testUtils';
import TransactionAdvancedOptions from '@/components/pages/Send/TransactionAdvancedOptions.vue';
import { transaction } from 'fixtures/transactions';

const localVue = createLocalVue();

localVue.use(VeeValidate);

describe('Send – TransactionAdvancedOptions', () => {
  const mountProps = {
    transaction,
  };
  let wrapper;

  beforeEach(() => {
    jest.clearAllMocks();

    wrapper = shallow(TransactionAdvancedOptions, {
      stubs: generateStubs(TransactionAdvancedOptions),
      propsData: mountProps,
      provide: () => ({
        $validator: new VeeValidate.Validator(),
      }),
      localVue,
    });
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
        wrapper.setProps({
          transaction: {
            gasPrice: 999,
          },
        });

        expect(wrapper.vm.form.gasPrice).toBe(999);
      });

      it('should update nonce in form if transaction nonce changed', () => {
        wrapper.setProps({
          transaction: {
            nonce: 999,
          },
        });

        expect(wrapper.vm.form.nonce).toBe(999);
      });
    });
  });
});
