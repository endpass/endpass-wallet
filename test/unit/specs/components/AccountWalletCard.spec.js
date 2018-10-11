import Vuex from 'vuex';
import { shallow, createLocalVue } from '@vue/test-utils';
import { generateStubs } from '@/utils/testUtils';
import AccountWalletCard from '@/components/AccountWalletCard';
import { address } from 'fixtures/accounts';
import { tokensMappedByAddresses } from 'fixtures/tokens';

const localVue = createLocalVue();

localVue.use(Vuex);

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
      wrapper = shallow(AccountWalletCard, {
        ...options,
        stubs: generateStubs(AccountWalletCard),
      });
    });

    it('should be a Vue component', () => {
      expect(wrapper.isVueInstance()).toBeTruthy();
      expect(wrapper.name()).toBe('AccountWalletCard');
    });

    it('should render initial state of the component', () => {
      expect(wrapper.html()).toMatchSnapshot();
    });

    it('should correctly render component with current account', () => {
      wrapper.setProps({
        isCurrentAccount: true,
      });
      wrapper.setComputed({
        accountTokensList: [],
      });

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

      expect(wrapper.find('tokens-list').exists()).toBe(false);
    });

    it('should render tokens list if it is not loading', () => {
      wrapper.setData({
        isLoading: false,
      });

      expect(wrapper.find('tokens-list').exists()).toBe(true);
    });
  });

  describe('behavior', () => {
    it('should load tokens data on component create if tokens are empty', async () => {
      expect.assertions(2);

      wrapper = shallow(AccountWalletCard, {
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

      wrapper = shallow(AccountWalletCard, {
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
