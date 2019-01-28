import Vuex from 'vuex';
import { shallowMount, createLocalVue } from '@vue/test-utils';
import UIComponents from '@endpass/ui';

import AccountWalletCard from '@/components/AccountWalletCard';

import { address } from 'fixtures/accounts';
import { tokensMappedByAddresses } from 'fixtures/tokens';

const localVue = createLocalVue();
localVue.use(Vuex);
localVue.use(UIComponents);

describe('AccountWalletCard', () => {
  let wrapper;
  let store;
  let options;
  let tokensActions;

  beforeEach(() => {
    tokensActions = {
      getTokensByAddress: jest.fn(),
      getTokensBalancesByAddress: jest.fn(),
    };
    store = new Vuex.Store({
      modules: {
        tokens: {
          namespaced: true,
          getters: {
            fullTokensByAddress: jest.fn(() => () => ({})),
          },
          actions: tokensActions,
        },
      },
    });
    options = {
      propsData: {
        activeCurrencyName: 'ETH',
        balance: '20',
        address,
      },
      store,
      localVue,
    };

    jest.clearAllMocks();
  });

  describe('render', () => {
    beforeEach(() => {
      wrapper = shallowMount(AccountWalletCard, {
        ...options,
      });
    });

    it('should be a Vue component', () => {
      expect(wrapper.isVueInstance()).toBeTruthy();
      expect(wrapper.name()).toBe('AccountWalletCard');
    });

    it('should render initial state of the component', () => {
      expect(wrapper.html()).toMatchSnapshot();
    });

    it('should correctly render component with current account', async () => {
      expect.assertions(1);

      wrapper = shallowMount(AccountWalletCard, {
        ...options,
        computed: {
          accountTokensList: () => [],
        },
      });
      wrapper.setProps({
        isCurrentAccount: true,
      });

      await wrapper.vm.$nextTick();

      expect(wrapper.html()).toMatchSnapshot();
    });

    it('should correctly render component with send button', () => {
      wrapper.setProps({
        allowSend: true,
      });

      expect(wrapper.html()).toMatchSnapshot();
    });

    it('should not render tokens list during loading', () => {
      wrapper.setData({
        isLoading: true,
      });

      expect(wrapper.find('tokens-list-stub').exists()).toBe(false);
    });

    it('should render tokens list if it is not loading', () => {
      wrapper.setData({
        isLoading: false,
      });

      expect(wrapper.find('tokens-list-stub').exists()).toBe(true);
    });
  });

  describe('behavior', () => {
    it('should load tokens data on component create if tokens are empty', async () => {
      expect.assertions(2);

      wrapper = shallowMount(AccountWalletCard, {
        ...options,
        computed: {
          accountTokens: () => ({}),
        },
      });

      await global.flushPromises();

      expect(tokensActions.getTokensByAddress).toBeCalled();
      expect(tokensActions.getTokensBalancesByAddress).toBeCalled();
    });

    it('should not load tokens data on component create if tokens are not empty', async () => {
      expect.assertions(2);

      wrapper = shallowMount(AccountWalletCard, {
        ...options,
        computed: {
          accountTokens: () => tokensMappedByAddresses,
        },
      });

      await global.flushPromises();

      expect(tokensActions.getTokensByAddress).not.toBeCalled();
      expect(tokensActions.getTokensBalancesByAddress).toBeCalled();
    });
  });
});
