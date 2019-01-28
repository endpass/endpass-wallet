import Vuex from 'vuex';
import VeeValidate from 'vee-validate';
import { createLocalVue } from '@vue/test-utils';
import validation from '@/validation';
import UIComponents from '@endpass/ui';
import { wrapShallowMountFactory, wrapMountFactory } from '@/testUtils';

import DappPage from '@/components/pages/Dapp';

import { commonRequest, transactionRequest } from 'fixtures/dapp';

const localVue = createLocalVue();

localVue.use(Vuex);
localVue.use(validation);
localVue.use(VeeValidate);
localVue.use(UIComponents);

describe('DappPage', () => {
  const dappActions = {
    inject: jest.fn(),
    reset: jest.fn(),
    processCurrentRequest: jest.fn(),
    cancelCurrentRequest: jest.fn(),
  };
  let store;
  let wrapper;
  let wrapperFactory;
  let wrapperMountFactory;

  beforeEach(() => {
    jest.clearAllMocks();

    store = new Vuex.Store({
      state: {
        web3: {
          activeCurrency: {
            id: 'test',
            name: 'test',
          },
        },
      },
      modules: {
        accounts: {
          state: {},
          getters: {
            isPublicAccount: () => false,
          },
          namespaced: true,
        },
        dapp: {
          state: {
            injected: false,
          },
          getters: {
            currentRequest: () => null,
          },
          actions: dappActions,
          namespaced: true,
        },
      },
      mutations: {
        testInjected(state, flag) {
          state.dapp.injected = flag;
        },
      },
    });

    wrapperFactory = wrapShallowMountFactory(DappPage, {
      store,
      localVue,
      sync: false,
    });

    wrapperMountFactory = wrapMountFactory(DappPage, {
      store,
      localVue,
      sync: false,
    });

    wrapper = wrapperFactory();
  });

  describe('render', () => {
    it('should render without iframe, modals and errors by default', () => {
      expect(wrapper.find('iframe-stub').exists()).toBe(false);
      expect(wrapper.find('dapp-error-stub').exists()).toBe(false);
      expect(wrapper.find('password-modal-stub').exists()).toBe(false);
      expect(wrapper.html()).toMatchSnapshot();
    });

    it('should render iframe if it loading but it must be hidden', async () => {
      expect.assertions(3);

      wrapper.setData({
        loading: true,
      });

      await wrapper.vm.$nextTick();

      expect(wrapper.find('iframe').exists()).toBe(true);
      expect(wrapper.find('iframe').attributes().style).toContain(
        'display: none',
      );
      expect(wrapper.html()).toMatchSnapshot();
    });

    it('should render iframe it loaded', async () => {
      expect.assertions(3);

      wrapper.setData({
        loaded: true,
      });

      await wrapper.vm.$nextTick();

      expect(wrapper.find('iframe').exists()).toBe(true);
      expect(wrapper.find('iframe').attributes().style).toBeUndefined();
      expect(wrapper.html()).toMatchSnapshot();
    });

    it('should render error', async () => {
      expect.assertions(2);

      wrapper.setData({
        error: true,
      });

      await wrapper.vm.$nextTick();

      expect(wrapper.find('.dapp-error').exists()).toBe(true);
      expect(wrapper.html()).toMatchSnapshot();
    });

    it('should render password modal if currentRequest exists', () => {
      wrapper = wrapperFactory({
        computed: {
          currentRequest: commonRequest,
        },
      });

      expect(wrapper.html()).toMatchSnapshot();
      expect(wrapper.find('password-modal-stub').exists()).toBe(true);
    });

    it('should render password modal with table if currentRequest is transaction', () => {
      wrapper = wrapperFactory({
        computed: {
          currentRequest: transactionRequest,
        },
      });

      expect(wrapper.html()).toMatchSnapshot();
      expect(wrapper.find('password-modal-stub').exists()).toBe(true);
      expect(
        wrapper
          .find('password-modal-stub')
          .find('transaction-table-stub')
          .exists(),
      ).toBe(true);
    });
  });

  describe('behavior', () => {
    describe('dapp page open', () => {
      let button;

      beforeEach(() => {
        wrapper = wrapperMountFactory();

        jest.spyOn(wrapper.vm, 'loadDapp');

        button = wrapper.find('[data-test=dapp-open-button]');
      });

      it('should not allow press button if url is empty', () => {
        button.trigger('click');

        expect(wrapper.vm.loadDapp).not.toBeCalled();
      });

      it('should not allow press button if url is not correct', async () => {
        expect.assertions(1);

        wrapper = wrapperMountFactory({
          computed: {
            isUrlCorrect: false,
          },
        });

        jest.spyOn(wrapper.vm, 'loadDapp');

        wrapper.setData({
          url: 'foo',
        });

        await wrapper.vm.$nextTick();

        wrapper.find('[data-test=dapp-open-button]').trigger('click');

        expect(wrapper.vm.loadDapp).not.toBeCalled();
      });

      it('should load dapp if url correct', async () => {
        expect.assertions(2);

        wrapper.setData({
          url: 'https://example.com',
        });

        await wrapper.vm.$nextTick();

        button.trigger('click');

        await wrapper.vm.$nextTick();

        expect(wrapper.vm.loadDapp).toBeCalled();
        expect(dappActions.inject).toBeCalledTimes(1);
      });
    });

    describe('web3 injecting to dapp', () => {
      it('should inject web3 to given dapp window and change loading status', async () => {
        expect.assertions(2);

        wrapper = wrapperMountFactory({
          store,
        });

        await wrapper.vm.loadDapp();

        expect(wrapper.vm.loading).toBe(true);
        expect(dappActions.inject).toBeCalledTimes(1);
      });
    });

    describe('should reset opened dapp', () => {
      it('should reset opened dapp on url change', async () => {
        expect.assertions(3);

        wrapper.setData({
          loaded: true,
        });

        await wrapper.vm.$nextTick();

        expect(wrapper.vm.loaded).toBe(true);

        wrapper.setData({
          url: 'foo',
        });

        await wrapper.vm.$nextTick();

        expect(wrapper.vm.loaded).toBe(false);
        expect(dappActions.reset).toBeCalledTimes(1);
      });
    });
  });

  describe('watchers', () => {
    describe('url', () => {
      it('should handle each url change with method', async () => {
        expect.assertions(1);

        jest.spyOn(wrapper.vm, 'onChangeUrlInput');

        wrapper.setData({
          url: 'foo',
        });

        await wrapper.vm.$nextTick();

        expect(wrapper.vm.onChangeUrlInput).toBeCalledTimes(1);
      });
    });

    describe('injected', () => {
      it('should reset dapp if inject status was changed to false', async () => {
        expect.assertions(2);

        wrapper.setData({
          loaded: true,
          loading: true,
        });

        await wrapper.vm.$nextTick();
        store.commit('testInjected', true);
        await wrapper.vm.$nextTick();
        store.commit('testInjected', false);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.loaded).toBe(false);
        expect(wrapper.vm.loading).toBe(false);
      });

      it('should not do anything if inject status is true', async () => {
        expect.assertions(2);

        wrapper.setData({
          loaded: true,
          loading: true,
        });

        await wrapper.vm.$nextTick();
        store.commit('testInjected', false);
        await wrapper.vm.$nextTick();
        store.commit('testInjected', true);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.loaded).toBe(true);
        expect(wrapper.vm.loading).toBe(true);
      });
    });
  });
});
