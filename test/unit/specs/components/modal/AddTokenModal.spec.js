import { shallow, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import VeeValidate from 'vee-validate';
import Notifications from 'vue-notification';
import AddTokenModal from '@/components/modal/AddTokenModal';
import { Token } from '@/class';

const localVue = createLocalVue();

localVue.use(Vuex);
localVue.use(VeeValidate);
localVue.use(Notifications);

describe('AddTokenModal', () => {
  let store;
  let wrapper;
  let fakeToken;
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
    wrapper = shallow(AddTokenModal, { store, localVue });
    fakeToken = new Token({
      address: '0x4Ce2109f8DB1190cd44BC6554E35642214FbE144',
      name: 'name',
      symbol: 'symbol',
      balanceOf: 'balanceOf',
      decimals: 8,
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
      await wrapper.vm.setTokenData(fakeToken);

      expect(wrapper.vm.token.symbol).toBe('SYMBOL');
      expect(wrapper.vm.token.name).toBe('name');
      expect(wrapper.vm.token.decimals).toBe(8);
    });

    // it('should set empty flags', async () => {
    //   await wrapper.vm.setTokenData(fakeEmptyToken);
    //
    //   expect(wrapper.vm.notFound.symbol).toBe(true);
    //   expect(wrapper.vm.notFound.name).toBe(true);
    //   expect(wrapper.vm.notFound.decimals).toBe(true);
    // });

    it('should correctly reset the contract data', async () => {
      await wrapper.vm.setTokenData(fakeToken);
      wrapper.vm.resetForm();

      expect(wrapper.vm.token.symbol).toBe('');
      expect(wrapper.vm.token.name).toBe('');
      expect(wrapper.vm.token.decimals).toBe('');
    });

    it('correctly resets empty flags', async () => {
      await wrapper.vm.setTokenData(fakeEmptyTokenData);
      wrapper.vm.resetForm();

      expect(wrapper.vm.notFound.symbol).toBe(false);
      expect(wrapper.vm.notFound.name).toBe(false);
      expect(wrapper.vm.notFound.decimals).toBe(false);
    });

    it('should add token to the store', async () => {
      const addUserToken = jest.fn();
      wrapper.setData({ token: fakeToken });
      wrapper.setMethods({ addUserToken });

      await wrapper.vm.addToken();
      expect(addUserToken).toHaveBeenCalledWith({ token: fakeToken });
    });
  });
});
