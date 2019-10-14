import { shallowMount, createLocalVue } from '@vue/test-utils';
import Network from '@endpass/class/Network';
import Vuex from 'vuex';
import CurrencySelect from '@/components/bar/CurrencySelect';
import setupI18n from '@/locales/i18nSetup';

const localVue = createLocalVue();
const i18n = setupI18n(localVue);

localVue.use(Vuex);

describe('CurrencySelect', () => {
  let wrapper;
  let actions;

  beforeEach(() => {
    actions = {
      changeCurrency: jest.fn(),
    };
    const store = new Vuex.Store({
      modules: {
        web3: {
          namespaced: true,
          state: {
            activeCurrency: Network.CURRENCIES[0],
          },
          actions,
        },
      },
    });

    wrapper = shallowMount(CurrencySelect, {
      i18n,
      localVue,
      store,
    });
  });

  describe('render', () => {
    it('should be a Vue component', () => {
      expect(wrapper.name()).toBe('CurrencySelect');
      expect(wrapper.isVueInstance()).toBeTruthy();
    });

    it('should render initial state of the component', () => {
      expect(wrapper.element).toMatchSnapshot();
    });
  });
});
