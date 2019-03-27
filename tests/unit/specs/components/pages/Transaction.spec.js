import Vuex from 'vuex';
import { shallowMount, createLocalVue } from '@vue/test-utils';
import Transaction from '@/components/pages/Transaction';

const localVue = createLocalVue();

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
