import Vuex from 'vuex';
import { shallow, createLocalVue } from '@vue/test-utils';
import Message from '@/components/pages/Message';
import { generateStubs } from '@/utils/testUtils';

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
    wrapper = shallow(Message, {
      stubs: generateStubs(Message),
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
