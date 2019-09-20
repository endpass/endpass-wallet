import Vuex from 'vuex';
import { shallowMount, createLocalVue } from '@vue/test-utils';
import Transaction from '@/components/pages/Transaction';
import setupI18n from '@/locales/i18nSetup';

const localVue = createLocalVue();
const i18n = setupI18n(localVue);

localVue.use(Vuex);

describe('Transaction page', () => {
  let wrapper;
  let store;

  beforeEach(() => {
    store = new Vuex.Store({
      modules: {
        accounts: {
          namespaced: true,
          getters: {
            isPublicAccount: () => true,
          },
        },
      },
    });
    wrapper = shallowMount(Transaction, {
      i18n,
      localVue,
      store,
    });
  });

  describe('render', () => {
    it('should render the initial state of the page', () => {
      expect(wrapper.element).toMatchSnapshot();
    });

    it('should set Sign tab', () => {
      wrapper.setData({
        currentTab: 'sign',
      });

      expect(wrapper.element).toMatchSnapshot();
    });

    it('should set Recover tab', () => {
      wrapper.setData({
        currentTab: 'recover',
      });

      expect(wrapper.element).toMatchSnapshot();
    });
  });
});
