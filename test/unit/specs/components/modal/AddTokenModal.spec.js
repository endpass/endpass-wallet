import { shallow, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import VeeValidate from 'vee-validate';
import Notifications from 'vue-notification';
import AddTokenModal from '@/components/modal/AddTokenModal';
import { ERC20Token } from '@/class';
import { tokens } from 'fixtures/tokens';
import { testUtils } from '@endpass/utils';

const localVue = createLocalVue();

localVue.use(Vuex);
localVue.use(VeeValidate);
localVue.use(Notifications);

describe('AddTokenModal', () => {
  let store;
  let wrapper;
  let fakeEmptyTokenData;

  beforeEach(() => {
    store = new Vuex.Store({
      modules: {
        tokens: {
          namespaced: true,
          actions: {
            addTokenToSubscription() {},
          },
        },
        web3: {
          namespaced: true,
          state: {},
        },
      },
    });
    wrapper = shallow(AddTokenModal, {
      store,
      localVue,
      stubs: testUtils.generateStubs(AddTokenModal),
    });
    fakeEmptyTokenData = {
      symbol: undefined,
      name: undefined,
      decimals: undefined,
    };
  });

  describe('render', () => {
    it('should be a Vue component', () => {
      expect(wrapper.name()).toBe('AddTokenModal');
      expect(wrapper.isVueInstance()).toBeTruthy();
    });

    it('should render component', () => {
      expect(wrapper.element).toMatchSnapshot();
    });
  });

  describe('behavior', () => {
    it('should set the token data from the contract', async () => {
      expect.assertions(3);

      await wrapper.vm.setTokenData(tokens[0].address);

      expect(wrapper.vm.token.symbol).toBe(tokens[0].symbol);
      expect(wrapper.vm.token.name).toBe(tokens[0].name);
      expect(wrapper.vm.token.decimals).toBe(tokens[0].decimals);
    });

    it('should set empty flags', async () => {
      expect.assertions(1);

      ERC20Token.prototype.getToken.mockResolvedValueOnce(fakeEmptyTokenData);

      await wrapper.vm.setTokenData(tokens[0].address);

      expect(wrapper.vm.notFound).toEqual({
        decimals: true,
        name: true,
        symbol: true,
      });
    });

    it('should correctly reset the contract data', async () => {
      expect.assertions(1);

      await wrapper.vm.setTokenData(tokens[0].address);
      wrapper.vm.resetForm();

      expect(wrapper.vm.token).toEqual(wrapper.vm.$options.data().token);
    });

    it('correctly resets empty flags', async () => {
      expect.assertions(1);

      ERC20Token.prototype.getToken.mockResolvedValueOnce(fakeEmptyTokenData);

      await wrapper.vm.setTokenData(tokens[0].address);
      wrapper.vm.resetForm();

      expect(wrapper.vm.notFound).toEqual({
        decimals: false,
        name: false,
        symbol: false,
      });
    });

    it('should add token to the store', async () => {
      expect.assertions(1);

      const addUserToken = jest.fn();
      wrapper.setData({ token: tokens[0] });
      wrapper.setMethods({ addUserToken });

      await wrapper.vm.addToken();

      expect(addUserToken).toBeCalledWith({ token: tokens[0] });
    });

    it('should not add invalid token to the store', async () => {
      expect.assertions(1);

      const addUserToken = jest.fn();
      ERC20Token.prototype.getToken.mockResolvedValueOnce(fakeEmptyTokenData);
      wrapper.setMethods({ addUserToken });

      await wrapper.vm.addToken();

      expect(addUserToken).not.toBeCalled();
    });

    it('should show extra fields form for missing token data', async () => {
      expect.assertions(4);

      ERC20Token.prototype.getToken.mockResolvedValueOnce(fakeEmptyTokenData);

      await wrapper.vm.addToken();

      ['decimals', 'name', 'symbol'].forEach(item => {
        expect(
          wrapper.find(`v-input[data-test=token-${item}-input]`).exists(),
        ).toBe(true);
      });

      expect(wrapper.findAll('v-input')).toHaveLength(4);
    });
  });
});
