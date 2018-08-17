import { shallow, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import VeeValidate from 'vee-validate';
import AddTokenModal from '@/components/modal/AddTokenModal';
import { fakeContract, fakeEmptyContract } from 'fixtures/contracts';

const localVue = createLocalVue();

localVue.use(Vuex);
localVue.use(VeeValidate);

describe('AddTokenModal', () => {
  let store;
  let wrapper;

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
          state: {
            web3: {
              eth: {
                Contract: jest.fn(),
              },
            },
          },
        },
      },
    });
    wrapper = shallow(AddTokenModal, { store, localVue });
  });

  describe('render', () => {
    it('should be a Vue component', () => {
      expect(wrapper.name()).toBe('AddTokenModal');
      expect(wrapper.isVueInstance()).toBeTruthy();
    });
  });

  describe('behavior', () => {
    it('should set the token data from the contract', async () => {
      await wrapper.vm.setTokenData(fakeContract);

      expect(wrapper.vm.token.symbol).toBe('symbol');
      expect(wrapper.vm.token.name).toBe('name');
      expect(wrapper.vm.token.decimals).toBe('decimals');
    });

    it('should set empty flags', async () => {
      await wrapper.vm.setTokenData(fakeEmptyContract);

      expect(wrapper.vm.notFound.symbol).toBe(true);
      expect(wrapper.vm.notFound.name).toBe(true);
      expect(wrapper.vm.notFound.decimals).toBe(true);
    });

    it('should correctly reset the contract data', async () => {
      await wrapper.vm.setTokenData(fakeContract);
      wrapper.vm.resetForm();

      expect(wrapper.vm.token.symbol).toBe('');
      expect(wrapper.vm.token.name).toBe('');
      expect(wrapper.vm.token.decimals).toBe('');
    });

    it('correctly resets empty flags', async () => {
      await wrapper.vm.setTokenData(fakeEmptyContract);
      wrapper.vm.resetForm();

      expect(wrapper.vm.notFound.symbol).toBe(false);
      expect(wrapper.vm.notFound.name).toBe(false);
      expect(wrapper.vm.notFound.decimals).toBe(false);
    });

    it('should add token to the store', () => {
      const spy = jest.spyOn(wrapper.vm, 'addTokenToSubscription');
      wrapper.vm.addToken();

      expect(spy).toBeCalledWith(wrapper.vm.token);
    });

    it('should add a token with integer decimals', async () => {
      wrapper.vm.checkContractExistence = jest.fn().mockResolvedValueOnce();
      wrapper.vm.setTokenData = jest.fn().mockResolvedValueOnce();
      wrapper.vm.token = {
        symbol: 'symbol',
        name: 'name',
        decimals: '18',
      };
      const spy = jest.spyOn(wrapper.vm, 'addToken');

      await wrapper.vm.createToken();

      expect(spy).toBeCalledWith({
        ...wrapper.vm.token,
        decimals: 18,
      });
    });
  });
});
