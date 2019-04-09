import { createLocalVue } from '@vue/test-utils';
import Notifications from 'vue-notification';
import Vuex from 'vuex';
import VeeValidate from 'vee-validate';
import VueRouter from 'vue-router';
import UIComponents from '@endpass/ui';
import { wrapShallowMountFactory } from '@/testUtils';

import WalletsList from '@/components/walletsList/WalletsList';
import { Wallet } from '@/class';

import { addresses, address } from 'fixtures/accounts';

const WALLET_TYPES = Wallet.getTypes();

const addressPos = addresses.indexOf(address);

const localVue = createLocalVue();

localVue.use(Vuex);
localVue.use(VueRouter);
localVue.use(VeeValidate);
localVue.use(Notifications);
localVue.use(UIComponents);

jest.useFakeTimers();

describe('WalletsList', () => {
  let wrapper;
  let wrapperFactory;
  let actions;
  let router;

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
    router = new VueRouter();
    const store = new Vuex.Store(storeOptions);
    wrapperFactory = wrapShallowMountFactory(WalletsList, {
      localVue,
      store,
      router,
      // sync: false,
      propsData: {
        type: WALLET_TYPES.HD_PUBLIC,
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

        await wrapper.vm.getNextAddressess({ offset: 10, limit: 20 });
        expect(wrapper.vm.addresses).toEqual(emptyArray);
        expect(wrapper.vm.getNextWalletsFromHd).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.getNextWalletsFromHd).toBeCalledWith({
          offset: 10,
          limit: 20,
          walletType: WALLET_TYPES.HD_PUBLIC,
        });
      });

      it('should call changePage with correct arguments', async () => {
        expect.assertions(3);

        wrapper.setMethods({
          getNextWalletsFromHd: jest.fn().mockResolvedValue([]),
        });

        await wrapper.vm.changePage(3);
        expect(wrapper.vm.addresses).toEqual(emptyArray);
        expect(wrapper.vm.getNextWalletsFromHd).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.getNextWalletsFromHd).toBeCalledWith({
          offset: 20,
          limit: 10,
          walletType: WALLET_TYPES.HD_PUBLIC,
        });
      });
    });

    describe('handleImport', () => {
      const password = 'password';

      function extendWrap(inst) {
        inst.setMethods({
          getNextWalletsFromHd: jest.fn().mockResolvedValue(addresses),
          addPublicWallet: jest.fn().mockResolvedValue(),
          addHdChildWallets: jest.fn().mockResolvedValue(),
        });
        inst.setData({
          activeAddress: address,
          addresses,
        });
      }

      beforeEach(() => {
        router.push('/kek');

        extendWrap(wrapper);
      });

      it('should call vuex addPublicWallet with correct arguments and redirect to root', async () => {
        expect.assertions(6);

        wrapper = wrapperFactory({
          computed: {
            isHDv3WalletByType: jest.fn().mockReturnValue(false),
          },
        });

        extendWrap(wrapper);

        expect(wrapper.vm.isPasswordModal).toBe(false);
        await wrapper.vm.handleImport();
        expect(wrapper.vm.isPasswordModal).toBe(false);

        expect(wrapper.vm.isHDv3WalletByType).toHaveBeenCalledTimes(2);
        expect(wrapper.vm.addPublicWallet).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.addPublicWallet).toBeCalledWith({
          address,
          info: {
            type: WALLET_TYPES.HD_PUBLIC,
            index: addressPos,
          },
        });

        expect(router.currentRoute.fullPath).toBe('/');
      });

      it('should call vuex addHdChildWallets with correct arguments and redirect to root', async () => {
        expect.assertions(6);

        wrapper = wrapperFactory({
          computed: {
            isHDv3WalletByType: jest.fn().mockReturnValue(true),
          },
        });

        extendWrap(wrapper);

        router.push('/kek');

        expect(wrapper.vm.isPasswordModal).toBe(false);
        await wrapper.vm.handleImport();
        expect(wrapper.vm.isPasswordModal).toBe(true);
        await wrapper.vm.handleImportByPassword(password);

        expect(wrapper.vm.isHDv3WalletByType).toHaveBeenCalledTimes(2);
        expect(wrapper.vm.addHdChildWallets).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.addHdChildWallets).toBeCalledWith({
          address,
          index: addressPos,
          password,
          type: WALLET_TYPES.HD_PUBLIC,
        });
        expect(router.currentRoute.fullPath).toBe('/');
      });

      it('should call throw error', async () => {
        expect.assertions(4);

        wrapper = wrapperFactory({
          computed: {
            isHDv3WalletByType: jest.fn().mockReturnValue(false),
          },
        });

        extendWrap(wrapper);

        const spy = jest.spyOn(wrapper.vm, '$notify');

        wrapper.setMethods({
          getNextWalletsFromHd: jest.fn().mockResolvedValue([]),
        });

        wrapper.setData({
          activeAddress: null,
        });

        router.push('/kek');

        await wrapper.vm.addWallet();

        expect(wrapper.vm.isHDv3WalletByType).toHaveBeenCalledTimes(0);

        expect(wrapper.vm.$notify).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.$notify).toHaveBeenCalledWith({
          title: 'Importing error',
          text: 'An error occurred while importing wallet. Please try again.',
          type: 'is-danger',
        });

        expect(router.currentRoute.fullPath).toBe('/kek');

        spy.mockRestore();
      });
    });

    it('should set active address', () => {
      wrapper.vm.setActiveAddress('foo');
      expect(wrapper.vm.activeAddress).toBe('foo');
    });
  });
});
