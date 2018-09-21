import Vuex from 'vuex';
import { shallow, createLocalVue } from '@vue/test-utils';
import Transaction from '@/components/pages/Transaction';
import { generateStubs } from '@/utils/testUtils';

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
    wrapper = shallow(Transaction, {
      stubs: generateStubs(Transaction),
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
