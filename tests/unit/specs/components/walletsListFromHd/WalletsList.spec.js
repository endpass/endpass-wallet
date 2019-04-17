import { createLocalVue } from '@vue/test-utils';
import Notifications from 'vue-notification';
import Vuex from 'vuex';
import VeeValidate from 'vee-validate';
import VueRouter from 'vue-router';
import UIComponents from '@endpass/ui';
import { wrapShallowMountFactory } from '@/testUtils';

import WalletsList from '@/components/walletsListFromHd/WalletsList';
import { Wallet } from '@/class';

const WALLET_TYPES = Wallet.getTypes();

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

        wrapper.find('v-pagination-stub').vm.$emit('input', 1);
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

        wrapper.find('v-pagination-stub').vm.$emit('input', 3);
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
  });
});
