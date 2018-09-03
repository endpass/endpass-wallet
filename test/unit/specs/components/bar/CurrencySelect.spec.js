import { shallow, createLocalVue } from '@vue/test-utils';

import Vuex from 'vuex';
const localVue = createLocalVue();

localVue.use(Vuex);

import CurrencySelect from '@/components/bar/CurrencySelect';

describe('CurrencySelect', () => {
  describe('render', () => {
    let wrapper;
    beforeEach(() => {
      let storeOptions = {
        modules: {
          web3: {
            namespaced: true,
            state: {
              activeCurrency: 'KEK',
              currencies: ['KEK', 'ETH'],
            },
            actions: {
              changeCurrency: jest.fn(),
            },
          },
        },
      };
      const store = new Vuex.Store(storeOptions);
      wrapper = shallow(CurrencySelect, {
        localVue,
        store,
      });
    });

    it('should be a Vue component', () => {
      expect(wrapper.isVueInstance()).toBeTruthy();
    });
  });
});
