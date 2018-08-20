import Vuex from 'vuex';
import VeeValidate from 'vee-validate';
import { shallow, createLocalVue, mount } from '@vue/test-utils';

import CustomProviderModal from '@/components/bar/CustomProviderModal';

const localVue = createLocalVue();

localVue.use(Vuex);
localVue.use(VeeValidate);

describe('CustomProviderModal', () => {
  let wrapper;
  let store;
  let options;

  beforeEach(() => {
    store = new Vuex.Store({
      modules: {
        web3: {},
      },
    });

    options = {
      store,
      localVue,
      computed: {
        networks: () => [],
        currencies: () => [],
      },
      methods: {
        addNewProviderToStore: () => null,
        validateNetwork: () => Promise.resolve(),
      },
    };
  });

  describe('render', () => {
    beforeEach(() => {
      wrapper = shallow(CustomProviderModal, {
        ...options,
      });
    });

    it('should be a Vue component', () => {
      expect(wrapper.name()).toBe('CustomProviderModal');
      expect(wrapper.isVueInstance()).toBeTruthy();
    });
  });

  describe('behavior', () => {
    beforeEach(() => {
      wrapper = shallow(CustomProviderModal, {
        ...options,
      });
    });

    it('should return comma-separated links of providers', () => {
      expect(wrapper.vm.providersLinks).toBe('');

      wrapper.setComputed({
        networks: [{ url: '123' }, { url: '456' }],
      });

      expect(wrapper.vm.providersLinks).toBe('123,456');
    });

    it('should call an action to validate the network', () => {
      const spy = jest.spyOn(wrapper.vm, 'validateNetwork');

      wrapper.vm.addNewProvider();

      expect(spy).toBeCalled();
    });

    it('should call an action to add the network', async () => {
      const spy = jest.spyOn(wrapper.vm, 'addNewProviderToStore');

      await wrapper.vm.addNewProvider();

      expect(spy).toBeCalled();
    });

    it('should emit close event when not loading', () => {
      wrapper.vm.close();

      wrapper.setData({
        isLoading: true,
      });

      wrapper.vm.close();

      expect(wrapper.emitted().close.length).toBe(1);
    });

    it('should add an error when validation fails', async () => {
      wrapper.vm.validateNetwork = () => Promise.reject();

      await wrapper.vm.addNewProvider();
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.errors.has('url')).toBeTruthy();
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
