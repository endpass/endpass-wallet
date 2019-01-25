import VeeValidate from 'vee-validate';
import { shallow, createLocalVue } from '@vue/test-utils';
import TransactionPriorityOptions from '@/components/pages/Send/TransactionPriorityOptions.vue';
import { gasPrice } from 'fixtures/gasPrice';

const localVue = createLocalVue();

localVue.use(VeeValidate);

describe('Send – TransactionPriorityOptions', () => {
  const mountProps = {
    prices: gasPrice,
    value: gasPrice.medium.toString(),
  };
  let wrapper;

  beforeEach(() => {
    wrapper = shallow(TransactionPriorityOptions, {
      provide: () => ({
        $validator: new VeeValidate.Validator(),
      }),
      propsData: mountProps,
      localVue,
    });
  });

  describe('render', () => {
    it('should render correctly prices', () => {
      expect(wrapper.html()).toMatchSnapshot();
    });

    it('should not render options if prices are empty', () => {
      wrapper = shallow(TransactionPriorityOptions, {
        provide: () => ({
          $validator: new VeeValidate.Validator(),
        }),
        propsData: {
          prices: null,
          value: '0',
        },
        localVue,
      });

      expect(wrapper.html()).toMatchSnapshot();
    });
  });
});
