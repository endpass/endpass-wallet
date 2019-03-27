import { shallowMount, createLocalVue } from '@vue/test-utils';
import { Network } from '@endpass/class';
import CurrencySelect from '@/components/bar/CurrencySelect';
import Vuex from 'vuex';
const localVue = createLocalVue();

localVue.use(Vuex);

describe('CurrencySelect', () => {
  let wrapper, actions;
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
