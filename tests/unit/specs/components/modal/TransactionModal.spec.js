import { shallowMount, createLocalVue } from '@vue/test-utils';
import { TransactionFactory } from '@/class';
import Vuex from 'vuex';
import UIComponents from '@endpass/ui';
import validation from '@/validation';

import setupI18n from '@/locales/i18nSetup';
import TransactionModal from '@/components/modal/TransactionModal';

const localVue = createLocalVue();
const i18n = setupI18n(localVue);

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
        i18n,
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
