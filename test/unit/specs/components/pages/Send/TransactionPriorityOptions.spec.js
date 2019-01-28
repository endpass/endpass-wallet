import VeeValidate from 'vee-validate';
import { shallowMount, createLocalVue } from '@vue/test-utils';
import UIComponents from '@endpass/ui';

import TransactionPriorityOptions from '@/components/pages/Send/TransactionPriorityOptions.vue';

import { gasPrice } from 'fixtures/gasPrice';

const localVue = createLocalVue();

localVue.use(VeeValidate);
localVue.use(UIComponents);

describe('Send – TransactionPriorityOptions', () => {
  const mountProps = {
    prices: gasPrice,
    value: gasPrice.medium.toString(),
  };
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(TransactionPriorityOptions, {
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
      wrapper = shallowMount(TransactionPriorityOptions, {
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
