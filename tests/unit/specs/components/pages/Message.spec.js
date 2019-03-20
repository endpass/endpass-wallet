import Vuex from 'vuex';
import { shallowMount, createLocalVue } from '@vue/test-utils';
import Message from '@/components/pages/Message';

const localVue = createLocalVue();

localVue.use(Vuex);

describe('Message page', () => {
  let wrapper;
  let store;

  beforeEach(() => {
    store = new Vuex.Store({
      modules: {
        accounts: {
          namespaced: true,
          state: {
            wallet: {
              isPublic: false,
            },
          },
          getters: {
            isPublicAccount: () => true,
          },
        },
      },
    });
    wrapper = shallowMount(Message, {
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
        action: 'SIGN',
      });

      expect(wrapper.element).toMatchSnapshot();
    });

    it('should set Verify tab', () => {
      wrapper.setData({
        action: 'VERIFY',
      });

      expect(wrapper.element).toMatchSnapshot();
    });
  });
});
