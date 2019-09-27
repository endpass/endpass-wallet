import Vuex from 'vuex';
import VeeValidate from 'vee-validate';
import UIComponents from '@endpass/ui';
import { createLocalVue } from '@vue/test-utils';
import { wrapShallowMountFactory } from '@/testUtils';

import setupI18n from '@/locales/i18nSetup';
import CustomProviderModal from '@/components/bar/CustomProviderModal';
import { Network } from '@endpass/class';

describe('CustomProviderModal', () => {
  const web3Actions = {
    addNetwork: jest.fn(),
    validateNetwork: jest.fn(),
    updateNetwork: jest.fn(),
  };
  const web3Getters = {
    networks: jest.fn(() => [{ url: 'provider url' }]),
  };
  let wrapper;
  let componentOptions;
  let wrapFactory;

  beforeEach(() => {
    const localVue = createLocalVue();
    const i18n = setupI18n(localVue);

    localVue.use(Vuex);
    localVue.use(VeeValidate);
    localVue.use(UIComponents);

    const store = new Vuex.Store({
      modules: {
        web3: {
          namespaced: true,
          actions: web3Actions,
          getters: web3Getters,
          state: {
            currencies: [{ id: 1, name: 'ETH' }],
          },
        },
      },
    });

    componentOptions = {
      store,
      localVue,
      i18n,
      sync: false,
    };

    wrapFactory = wrapShallowMountFactory(
      CustomProviderModal,
      componentOptions,
    );
  });

  describe('render', () => {
    beforeEach(() => {
      wrapper = wrapFactory();
    });

    it('should be a Vue component', () => {
      expect(wrapper.name()).toBe('CustomProviderModal');
      expect(wrapper.isVueInstance()).toBeTruthy();
    });

    describe('url field', () => {
      it('should render correctly', () => {
        expect(wrapper.find('#url').html()).toMatchSnapshot();
      });
    });

    describe('header', () => {
      it('should render header for create new provider', async () => {
        expect.assertions(1);

        wrapper.setProps({});

        wrapper.vm.$forceUpdate();
        await wrapper.vm.$nextTick();

        expect(wrapper.find('header').text()).toBe('Add New Provider');
      });

      it('should render header for update provider', async () => {
        expect.assertions(1);

        wrapper.setProps({
          provider: {},
        });

        wrapper.vm.$forceUpdate();
        await wrapper.vm.$nextTick();

        expect(wrapper.find('header').text()).toBe('Update Provider');
      });
    });

    describe('footer', () => {
      it('should render button text for create new provider', async () => {
        expect.assertions(1);

        wrapper.setProps({});

        wrapper.vm.$forceUpdate();
        await wrapper.vm.$nextTick();

        expect(wrapper.find('[data-test=add-provider-button]').text()).toBe(
          'Create New Provider',
        );
      });

      it('should render button text for update provider', async () => {
        expect.assertions(1);

        wrapper.setProps({
          provider: {},
        });

        wrapper.vm.$forceUpdate();
        await wrapper.vm.$nextTick();

        expect(wrapper.find('[data-test=add-provider-button]').text()).toBe(
          'Update Provider',
        );
      });
    });
  });

  describe('computed', () => {
    beforeEach(() => {
      wrapper = wrapFactory();
    });

    describe('providersLinks', () => {
      const providerUrl1 = 'provider url 1';
      const providerUrl2 = 'provider url 2';

      it('should return provider links when creating a new provider', () => {
        let expected;

        wrapper = wrapFactory({
          computed: {
            networks: [{ url: providerUrl1 }],
          },
        });

        wrapper.setProps({});
        expected = providerUrl1;

        expect(wrapper.vm.providersLinks).toBe(expected);

        wrapper = wrapFactory({
          computed: {
            networks: [{ url: providerUrl1 }, { url: providerUrl2 }],
          },
        });

        expected = `${providerUrl1},${providerUrl2}`;

        expect(wrapper.vm.providersLinks).toBe(expected);
      });

      it('should return provider links when provider updates', () => {
        wrapper = wrapFactory({
          computed: {
            networks: [{ url: providerUrl1 }],
          },
        });

        wrapper.setProps({
          provider: {
            url: providerUrl1,
          },
        });

        expect(wrapper.vm.providersLinks).toBe('');

        wrapper = wrapFactory({
          computed: {
            networks: [{ url: providerUrl1 }, { url: providerUrl2 }],
          },
        });

        wrapper.setProps({
          provider: {
            url: providerUrl1,
          },
        });

        expect(wrapper.vm.providersLinks).toBe(providerUrl2);
      });
    });
  });

  describe('methods', () => {
    beforeEach(() => {
      wrapper = wrapFactory();
    });

    describe('handleButtonClick', () => {
      const provider = {
        name: 'provider url',
        url: 'provider url',
        currency: 1,
      };
      const error = {
        field: 'url',
        msg: 'Provider is invalid',
        id: 'wrongUrl',
      };

      describe('creating a new provider', () => {
        beforeEach(() => {
          wrapper.setProps({});
          wrapper.setData({
            innerProvider: provider,
          });
        });

        it('should create new provider', async () => {
          expect.assertions(6);

          const networkType = 'ropsten';
          const networkId = Network.NET_ID.ROPSTEN;
          const isSuccess = true;

          wrapper.setMethods({
            addNetwork: jest.fn().mockResolvedValueOnce(isSuccess),
            validateNetwork: jest
              .fn()
              .mockResolvedValueOnce([networkType, networkId]),
          });

          await wrapper.vm.handleButtonClick();

          expect(wrapper.vm.validateNetwork).toHaveBeenCalledTimes(1);
          expect(wrapper.vm.validateNetwork).toHaveBeenCalledWith({
            network: provider,
          });

          expect(wrapper.vm.addNetwork).toHaveBeenCalledTimes(1);
          expect(wrapper.vm.addNetwork).toHaveBeenCalledWith({
            network: {
              ...provider,
              networkType,
              id: networkId,
            },
          });

          expect(wrapper.vm.isLoading).toBeFalsy();
          expect(wrapper.vm.providerAdded).toBe(isSuccess);
        });

        it('should handle the validation error of the network', async () => {
          expect.assertions(5);

          wrapper.setMethods({
            validateNetwork: jest.fn().mockRejectedValue(),
          });
          jest.spyOn(wrapper.vm.errors, 'add');

          await wrapper.vm.handleButtonClick();

          expect(wrapper.vm.validateNetwork).toHaveBeenCalledTimes(1);
          expect(wrapper.vm.validateNetwork).toHaveBeenCalledWith({
            network: provider,
          });
          expect(wrapper.vm.isLoading).toBeFalsy();
          expect(wrapper.vm.errors.add).toHaveBeenCalledTimes(1);
          expect(wrapper.vm.errors.add).toHaveBeenCalledWith(
            expect.objectContaining(error),
          );
        });
      });

      describe('provider update', () => {
        beforeEach(() => {
          wrapper.setProps({
            provider,
          });
          wrapper.setData({
            innerProvider: provider,
          });
        });

        it('should update provider', async () => {
          expect.assertions(6);

          const networkType = 'ropsten';
          const networkId = Network.NET_ID.ROPSTEN;
          const isSuccess = true;

          wrapper.setMethods({
            updateNetwork: jest.fn().mockResolvedValueOnce(isSuccess),
            validateNetwork: jest
              .fn()
              .mockResolvedValue([networkType, networkId]),
          });

          await wrapper.vm.handleButtonClick();

          expect(wrapper.vm.validateNetwork).toHaveBeenCalledTimes(1);
          expect(wrapper.vm.validateNetwork).toHaveBeenCalledWith({
            network: provider,
          });

          expect(wrapper.vm.updateNetwork).toHaveBeenCalledTimes(1);
          expect(wrapper.vm.updateNetwork).toHaveBeenCalledWith({
            network: {
              ...provider,
              id: networkId,
              networkType,
            },
            oldNetwork: provider,
          });

          expect(wrapper.vm.isLoading).toBeFalsy();
          expect(wrapper.vm.providerAdded).toBeTruthy();
        });

        it('should handle the validation error of the network', async () => {
          expect.assertions(5);

          wrapper.setMethods({
            validateNetwork: jest.fn().mockRejectedValue(),
          });
          jest.spyOn(wrapper.vm.errors, 'add');

          await wrapper.vm.handleButtonClick();

          expect(wrapper.vm.validateNetwork).toHaveBeenCalledTimes(1);
          expect(wrapper.vm.validateNetwork).toHaveBeenCalledWith({
            network: provider,
          });
          expect(wrapper.vm.isLoading).toBeFalsy();
          expect(wrapper.vm.errors.add).toHaveBeenCalledTimes(1);
          expect(wrapper.vm.errors.add).toHaveBeenCalledWith(
            expect.objectContaining(error),
          );
        });
      });
    });
  });

  describe('behavior', () => {
    beforeEach(() => {
      wrapper = wrapFactory();
    });

    it('should emit close event when not loading', () => {
      wrapper.vm.close();

      wrapper.setData({
        isLoading: true,
      });

      wrapper.vm.close();

      expect(wrapper.emitted().close.length).toBe(1);
    });

    it('should remove an error when entering a new value', () => {
      wrapper.vm.errors.add({
        field: 'url',
        msg: 'Provider is invalid',
        id: 'wrongUrl',
      });

      expect(wrapper.vm.errors.has('url')).toBeTruthy();

      wrapper.vm.handleInput();

      expect(wrapper.vm.errors.has('url')).toBeFalsy();
    });
  });
});
