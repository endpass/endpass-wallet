import { shallowMount, createLocalVue } from '@vue/test-utils';
import { TransactionFactory } from '@/class';
import Vuex from 'vuex';
import UIComponents from '@endpass/ui';
import validation from '@/validation';

import TransactionModal from '@/components/modal/TransactionModal';

const localVue = createLocalVue();

localVue.use(Vuex);
localVue.use(validation);
localVue.use(UIComponents);

describe('TransactionModal', () => {
  describe('render', () => {
    let wrapper;
    beforeEach(() => {
      const transaction = TransactionFactory.fromSendForm({
        data: '0x0',
        from: '0x0',
      });
      const store = new Vuex.Store({
        modules: {
          web3: {
            namespaced: true,
            state: {
              activeCurrency: { name: 'KEK' },
            },
          },
        },
      });
      wrapper = shallowMount(TransactionModal, {
        store,
        localVue,
        propsData: {
          transaction,
        },
        sync: false,
      });
    });

    it('should be a Vue component', () => {
      expect(wrapper.name()).toBe('TransactionModal');
      expect(wrapper.isVueInstance()).toBeTruthy();
    });

    it('should render initial state of the component', () => {
      expect(wrapper.element).toMatchSnapshot();
    });
  });
});
