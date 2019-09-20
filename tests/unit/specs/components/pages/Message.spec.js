import Vuex from 'vuex';
import { shallowMount, createLocalVue } from '@vue/test-utils';
import Message from '@/components/pages/Message';
import setupI18n from '@/locales/i18nSetup';

const localVue = createLocalVue();
const i18n = setupI18n(localVue);

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
