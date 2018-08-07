import Vuex from 'vuex';
import { shallow, createLocalVue, mount } from '@vue/test-utils';

import ProviderSelect from '@/components/bar/ProviderSelect';

const localVue = createLocalVue();

localVue.use(Vuex);

describe('ProviderSelect', () => {
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
        activeNet: () => null,
      },
      methods: {
        changeNetwork: () => null,
      },
    };
  });

  describe('render', () => {
    beforeEach(() => {
      wrapper = shallow(ProviderSelect, {
        ...options,
      });
    });

    it('should be a Vue component', () => {
      expect(wrapper.name()).toBe('ProviderSelect');
      expect(wrapper.isVueInstance()).toBeTruthy();
    });
  });

  describe('behavior', () => {
    beforeEach(() => {
      wrapper = shallow(ProviderSelect, {
        ...options,
      });
    });

    it('should unite providers and option for adding a provider', () => {
      expect(wrapper.vm.networkOptions).toHaveLength(1);

      wrapper.setComputed({
        networks: [{}, {}],
      });

      expect(wrapper.vm.networkOptions).toHaveLength(3);
    });

    it('should open a modal with corresponding option', () => {
      const spy = jest.spyOn(wrapper.vm, 'openCustomProviderModal');

      wrapper.vm.selectNet({ id: -1 });

      expect(spy).toBeCalled();
    });

    it('should call an action to change the network', () => {
      const spy = jest.spyOn(wrapper.vm, 'changeNetwork');

      wrapper.vm.selectNet({ id: 1 });

      expect(spy).toBeCalled();
    });
  });
});
