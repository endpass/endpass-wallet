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
  let accoutsModule;
  let tokensModule;

  beforeEach(() => {
    tokensModule = {
      namespaced: true,
      actions: {
        getTokensByAddress: jest.fn(),
        getTokensBalancesByAddress: jest.fn(),
      },
      getters: {
        fullTokensByAddress: () => ({}),
        allCurrentAccountFullTokens: () => tokensMappedByAddresses,
      },
    };
    accoutsModule = {
      namespaced: true,
      actions: {
        getBalanceByAddress: jest.fn().mockResolvedValue({
          balance: 10000000000000,
          tokens: [],
        }),
      },
      getters: {
        balance: jest.fn(() => '10'),
      },
    };
    store = new Vuex.Store({
      modules: {
        accounts: accoutsModule,
        tokens: tokensModule,
      },
    });
    options = {
      propsData: {
        activeCurrencyName: 'ETH',
        balance: '20',
        activeNetId: 1,
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

    it('should render spinner and not render tokens list if isLoading is truthy', () => {
      wrapper = shallowMount(AccountWalletCard, {
        ...options,
        propsData: {
          ...options.propsData,
          isLoading: true,
        },
      });

      expect(wrapper.find('v-spinner-stub').exists()).toBe(true);
      expect(wrapper.find('tokens-list-stub').exists()).toBe(false);
    });

    it('should render currenct account balance and tokens if isCurrentAccount flag is truthy', () => {
      wrapper = shallowMount(AccountWalletCard, {
        ...options,
        propsData: {
          ...options.propsData,
          isCurrentAccount: true,
        },
      });

      expect(wrapper.html()).toMatchSnapshot();
    });
  });

  describe('behavior', () => {
    it('should request balance data is isCurrentAccount flag is falsy', () => {
      wrapper = shallowMount(AccountWalletCard, {
        ...options,
        propsData: {
          ...options.propsData,
          isCurrentAccount: false,
        },
      });

      expect(accoutsModule.actions.getBalanceByAddress).toBeCalled();
    });

    it('should not request balance data is isCurrentAccount flag is truthy', () => {
      wrapper = shallowMount(AccountWalletCard, {
        ...options,
        propsData: {
          ...options.propsData,
          isCurrentAccount: true,
        },
      });

      expect(accoutsModule.actions.getBalanceByAddress).not.toBeCalled();
    });

    it('should emit send event by send button click', () => {
      wrapper = shallowMount(AccountWalletCard, {
        ...options,
        propsData: {
          ...options.propsData,
          allowSend: true,
        },
      });

      wrapper.find('[data-test=send-button]').vm.$emit('click');

      expect(wrapper.emitted().send).toBeTruthy();
    });
  });
});
