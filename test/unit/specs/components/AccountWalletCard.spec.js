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

  beforeEach(() => {
    store = new Vuex.Store({
      modules: {
        tokens: {
          namespaced: true,
          getters: {
            fullTokensByAddress: () => () => ({}),
          },
          actions: {
            getTokensByAddress: jest.fn(),
            getTokensBalancesByAddress: jest.fn(),
          },
        },
      },
    });
    options = {
      propsData: {
        activeCurrencyName: 'ETH',
        balance: '20',
        address,
      },
      stubs: generateStubs(AccountWalletCard),
      store,
      localVue,
    };

    wrapper = shallow(AccountWalletCard, options);

    jest.clearAllMocks();
  });

  describe('render', () => {
    it('should be a Vue component', () => {
      expect(wrapper.isVueInstance()).toBeTruthy();
      expect(wrapper.name()).toBe('AccountWalletCard');
    });

    it('should render initial state of the component', () => {
      expect(wrapper.html()).toMatchSnapshot();
    });

    it('should correctly render loading component', () => {
      wrapper.setData({
        isLoading: true,
      });

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
  });

  describe('behavior', () => {
    // TODO: methods are not correclty called in create hook vie test utils render
    it('should load tokens data on component create if tokens are empty', async () => {
      expect.assertions(2);

      wrapper = shallow(AccountWalletCard, {
        ...options,
        computed: {
          accountTokens: () => ({}),
        },
      });
      wrapper.vm.getTokensByAddress = jest.fn();
      wrapper.vm.getTokensBalancesByAddress = jest.fn();

      await wrapper.vm.loadTokensData();

      expect(wrapper.vm.getTokensByAddress).toHaveBeenCalledWith({
        address,
      });
      expect(wrapper.vm.getTokensBalancesByAddress).toHaveBeenCalledWith({
        address,
      });
    });

    it('should not load tokens data on component create if tokens are not empty', async () => {
      expect.assertions(2);

      wrapper = shallow(AccountWalletCard, {
        ...options,
        computed: {
          accountTokens: () => tokensMappedByAddresses,
        },
      });

      wrapper.vm.getTokensByAddress = jest.fn();
      wrapper.vm.getTokensBalancesByAddress = jest.fn();

      await wrapper.vm.loadTokensData();

      expect(wrapper.vm.getTokensByAddress).not.toBeCalled();
      expect(wrapper.vm.getTokensBalancesByAddress).toBeCalledWith({
        address,
      });
    });
  });
});
