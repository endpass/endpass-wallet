import Vuex from 'vuex';
import { shallow, createLocalVue } from '@vue/test-utils';

import ProviderSelect from '@/components/bar/ProviderSelect';
import { generateStubs } from '@/utils/testUtils';

describe('ProviderSelect', () => {
  const activeNet = {
    name: 'Main',
    id: 1,
  };
  const web3Actions = {
    changeNetwork: jest.fn(),
    deleteProvider: jest.fn(),
  };
  const web3Getters = {
    networks: jest.fn(() => [activeNet]),
    isCustomNetwork: jest.fn(() => false),
  };
  let wrapper;
  let componentOptions;

  beforeEach(() => {
    const localVue = createLocalVue();

    localVue.use(Vuex);

    const store = new Vuex.Store({
      modules: {
        web3: {
          namespaced: true,
          actions: web3Actions,
          getters: web3Getters,
          state: {
            activeNet,
          },
        },
      },
    });

    componentOptions = {
      store,
      localVue,
    };
  });

  describe('render', () => {
    beforeEach(() => {
      wrapper = shallow(ProviderSelect, componentOptions);
    });

    it('should be a Vue component', () => {
      expect(wrapper.name()).toBe('ProviderSelect');
      expect(wrapper.isVueInstance()).toBeTruthy();
    });
  });

  describe('behavior', () => {
    beforeEach(() => {
      wrapper = shallow(ProviderSelect, componentOptions);
    });

    it('should unite providers and option for adding a provider', () => {
      expect(wrapper.vm.networkOptions).toHaveLength(2);

      wrapper.setComputed({
        networks: [{}, {}],
      });

      expect(wrapper.vm.networkOptions).toHaveLength(3);
    });

    it('should open a modal with corresponding option', () => {
      const spy = jest.spyOn(wrapper.vm, 'openCustomProviderModal');
      const network = {};

      wrapper.vm.selectNet(network);

      expect(spy).toBeCalled();
    });

    it('should call an action to change the network', () => {
      const spy = jest.spyOn(wrapper.vm, 'changeNetwork');
      const network = { url: 'url' };

      wrapper.vm.selectNet(network);

      expect(spy).toBeCalled();
    });
  });
});
