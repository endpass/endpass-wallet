import Vuex from 'vuex';
import VeeValidate from 'vee-validate';
import { shallow, mount, createLocalVue } from '@vue/test-utils';
import { generateStubs } from '@/utils/testUtils';
import DappPage from '@/components/pages/Dapp';
import { commonRequest, transactionRequest } from 'fixtures/dapp';

const localVue = createLocalVue();

localVue.use(Vuex);
localVue.use(VeeValidate);

describe('DappPage', () => {
  const dappActions = {
    inject: jest.fn(),
    reset: jest.fn(),
    processCurrentRequest: jest.fn(),
    cancelCurrentRequest: jest.fn(),
  };
  let store;
  let wrapper;

  beforeEach(() => {
    jest.clearAllMocks();

    store = new Vuex.Store({
      state: {
        web3: {},
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
          state: {},
          getters: {
            currentRequest: () => null,
          },
          actions: dappActions,
          namespaced: true,
        },
      },
    });

    wrapper = shallow(DappPage, {
      stubs: generateStubs(DappPage),
      store,
      localVue,
    });
  });

  describe('render', () => {
    it('should render without iframe, modals and errors by default', () => {
      expect(wrapper.find('iframe').exists()).toBe(false);
      expect(wrapper.find('dapp-error').exists()).toBe(false);
      expect(wrapper.find('password-modal').exists()).toBe(false);
      expect(wrapper.html()).toMatchSnapshot();
    });

    it('should render iframe if it loading but it must be hidden', () => {
      wrapper.setData({
        loading: true,
      });

      expect(wrapper.find('iframe').exists()).toBe(true);
      expect(wrapper.find('iframe').attributes().style).toContain(
        'display: none',
      );
      expect(wrapper.html()).toMatchSnapshot();
    });

    it('should render iframe it loaded', () => {
      wrapper.setData({
        loaded: true,
      });

      expect(wrapper.find('iframe').exists()).toBe(true);
      expect(wrapper.find('iframe').attributes().style).toBeUndefined();
      expect(wrapper.html()).toMatchSnapshot();
    });

    it('should render error', () => {
      wrapper.setData({
        error: true,
      });

      expect(wrapper.find('.dapp-error').exists()).toBe(true);
      expect(wrapper.html()).toMatchSnapshot();
    });

    it('should render password modal if currentRequest exists', () => {
      wrapper.setComputed({
        currentRequest: commonRequest,
      });

      expect(wrapper.html()).toMatchSnapshot();
      expect(wrapper.find('password-modal').exists()).toBe(true);
    });

    it('should render password modal with table if currentRequest is transaction', () => {
      wrapper.setComputed({
        currentRequest: transactionRequest,
      });

      expect(wrapper.html()).toMatchSnapshot();
      expect(wrapper.find('password-modal').exists()).toBe(true);
      expect(
        wrapper
          .find('password-modal')
          .find('transaction-table')
          .exists(),
      ).toBe(true);
    });
  });

  describe('behavior', () => {
    describe('dapp page open', () => {
      let button;

      beforeEach(() => {
        wrapper = mount(DappPage, {
          localVue,
          store,
        });

        jest.spyOn(wrapper.vm, 'loadDapp');

        button = wrapper.find('[data-test=dapp-open-button]');
      });

      it('should not allow press button if url is empty', () => {
        button.trigger('click');

        expect(wrapper.vm.loadDapp).not.toBeCalled();
      });

      it('should not allow press button if url is not correct', () => {
        wrapper.setData({
          url: 'foo',
        });
        wrapper.setComputed({
          isUrlCorrect: false,
        });

        button.trigger('click');

        expect(wrapper.vm.loadDapp).not.toBeCalled();
      });

      it('should load dapp if url correct', () => {
        wrapper.setData({
          url: 'https://example.com',
        });

        button.trigger('click');

        expect(wrapper.vm.loadDapp).toBeCalled();
      });
    });

    describe('web3 injecting to dapp', () => {
      it('should inject web3 to given dapp window and change loading status', async () => {
        await wrapper.vm.loadDapp();

        expect(wrapper.vm.loading).toBe(true);
        expect(dappActions.inject).toBeCalledTimes(1);
      });
    });

    describe('should reset opened dapp', () => {
      it('should reset opened dapp on url change', () => {
        wrapper.setData({
          loaded: true,
        });

        expect(wrapper.vm.loaded).toBe(true);

        wrapper.setData({
          url: 'foo',
        });

        expect(wrapper.vm.loaded).toBe(false);
        expect(dappActions.reset).toBeCalledTimes(1);
      });
    });
  });

  describe('watchers', () => {
    describe('url', () => {
      it('should handle each url change with method', () => {
        jest.spyOn(wrapper.vm, 'onChangeUrlInput');

        wrapper.setData({
          url: 'foo',
        });

        expect(wrapper.vm.onChangeUrlInput).toBeCalledTimes(1);
      });
    });

    describe('injected', () => {
      it('should reset dapp if inject status was changed to false', () => {
        wrapper.setData({
          loaded: true,
          loading: true,
        });
        wrapper.setComputed({
          injected: false,
        });

        expect(wrapper.vm.loaded).toBe(false);
        expect(wrapper.vm.loading).toBe(false);
      });

      it('should not do anything if inject status is true', () => {
        wrapper.setData({
          loaded: true,
          loading: true,
        });
        wrapper.setComputed({
          injected: true,
        });

        expect(wrapper.vm.loaded).toBe(true);
        expect(wrapper.vm.loading).toBe(true);
      });
    });
  });
});
