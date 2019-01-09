import { shallow, createLocalVue } from '@vue/test-utils';
import { TransactionFactory } from '@/class';
import Vuex from 'vuex';

import TransactionModal from '@/components/modal/TransactionModal';

const localVue = createLocalVue();

localVue.use(Vuex);

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
              activeCurrency: 'KEK',
            },
          },
        },
      });
      wrapper = shallow(TransactionModal, {
        store,
        localVue,
        propsData: {
          transaction,
        },
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
