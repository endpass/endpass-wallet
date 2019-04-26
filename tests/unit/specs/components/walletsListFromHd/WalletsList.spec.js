import { createLocalVue } from '@vue/test-utils';
import Notifications from 'vue-notification';
import Vuex from 'vuex';
import VeeValidate from 'vee-validate';
import UIComponents from '@endpass/ui';
import { wrapShallowMountFactory } from '@/testUtils';

import WalletsList from '@/components/walletsListFromHd/WalletsList';
import { Wallet } from '@/class';
import { v3 } from 'fixtures/accounts';

const WALLET_TYPES = Wallet.getTypes();

const localVue = createLocalVue();

localVue.use(Vuex);
localVue.use(VeeValidate);
localVue.use(Notifications);
localVue.use(UIComponents);

jest.useFakeTimers();

describe('WalletsList', () => {
  let wrapper;
  let wallets;
  let wrapperFactory;
  let actions;

  beforeEach(() => {
    actions = {
      addPublicWallet: jest.fn(),
      getNextWalletsFromHd: jest.fn(),
      addHdChildWallets: jest.fn(),
    };
    const storeOptions = {
      modules: {
        accounts: {
          namespaced: true,
          actions,
          getters: {
            isHDv3WalletByType: jest.fn(),
          },
        },
      },
    };
    const store = new Vuex.Store(storeOptions);
    wallets = {
      [v3.address]: {
        ...v3,
        isPublic: false,
        isHardware: false,
      },
    };
    wrapperFactory = wrapShallowMountFactory(WalletsList, {
      localVue,
      store,
      // sync: false,
      propsData: {
        type: WALLET_TYPES.HD_PUBLIC,
      },
      computed: {
        wallets,
      },
    });
    wrapper = wrapperFactory();
  });

  describe('render', () => {
    it('should be a Vue component', () => {
      expect(wrapper.name()).toBe('WalletsList');
      expect(wrapper.isVueInstance()).toBeTruthy();
    });

    it('should render initial state of the component', () => {
      expect(wrapper.element).toMatchSnapshot();
    });
  });

  describe('methods', () => {
    const emptyArray = [];

    describe('getNextAddressess', () => {
      it('should call vuex getNextWalletsFromHd with correct arguments', async () => {
        expect.assertions(3);

        wrapper.setMethods({
          getNextWalletsFromHd: jest.fn().mockResolvedValue([]),
        });

        wrapper.find('v-pagination-stub').vm.$emit('offset', 0);
        await global.flushPromises();

        expect(wrapper.vm.addresses).toEqual(emptyArray);
        expect(wrapper.vm.getNextWalletsFromHd).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.getNextWalletsFromHd).toBeCalledWith({
          offset: 0,
          limit: wrapper.vm.limit,
          walletType: WALLET_TYPES.HD_PUBLIC,
        });
      });

      it('should call changePage with correct arguments', async () => {
        expect.assertions(3);

        wrapper.setMethods({
          getNextWalletsFromHd: jest.fn().mockResolvedValue([]),
        });

        wrapper.find('v-pagination-stub').vm.$emit('offset', 20);
        await global.flushPromises();
        expect(wrapper.vm.addresses).toEqual(emptyArray);
        expect(wrapper.vm.getNextWalletsFromHd).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.getNextWalletsFromHd).toBeCalledWith({
          offset: 20,
          limit: 10,
          walletType: WALLET_TYPES.HD_PUBLIC,
        });
      });
    });

    describe('updateSelectedAddress', () => {
      it('should emit correct address and index', () => {
        const addresses = ['a', 'b', 'c'];
        wrapper.setData({
          addresses,
        });

        addresses.forEach((address, index) => {
          wrapper.setData({
            offset: 10 * index,
          });
          wrapper
            .findAll('wallet-item-stub')
            .at(index)
            .vm.$emit('click');
          expect(wrapper.vm.selectedAddress).toBe(address);
          const payload = { address, index: index + wrapper.vm.offset };
          expect(wrapper.emitted('select')[index]).toEqual([payload]);
        });
      });
    });

    describe('usedWallet', () => {
      it('should check if wallet already added', () => {
        expect(wrapper.vm.isUsedWallet('foo')).toBeFalsy();
        expect(wrapper.vm.isUsedWallet(v3.address)).toBeTruthy();
        wallets[v3.address].isPublic = true;
        expect(wrapper.vm.isUsedWallet(v3.address)).toBeFalsy();
        wallets[v3.address].isPublic = false;
        wallets[v3.address].isHardware = true;
        expect(wrapper.vm.isUsedWallet(v3.address)).toBeFalsy();
        wallets[v3.address].isPublic = true;
        expect(wrapper.vm.isUsedWallet(v3.address)).toBeFalsy();
      });
    });
  });
});
