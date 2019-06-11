import Vuex from 'vuex';
import { createLocalVue, shallowMount } from '@vue/test-utils';
import { wrapShallowMountFactory } from '@/testUtils';

import SyncStatus from '@/components/bar/SyncStatus';

const localVue = createLocalVue();

localVue.use(Vuex);

describe('SyncStatus', () => {
  let wrapper;
  let wrapperFactory;
  const isApiConnecting = true;
  let state;

  beforeEach(() => {
    state = {
      modules: {
        web3: {
          namespaced: true,
          state: {
            blockNumber: 1,
          },
        },
        connectionStatus: {
          namespaced: true,
          getters: {
            appStatus: () => 'failed',
          },
          state: {
            isApiConnecting,
          },
        },
      },
    };
    const store = new Vuex.Store(state);

    wrapperFactory = wrapShallowMountFactory(SyncStatus, {
      localVue,
      store,
    });
    wrapper = wrapperFactory();
  });
  describe('render', () => {
    it('should be a Vue component', () => {
      expect(wrapper.name()).toBe('SyncStatus');
      expect(wrapper.isVueInstance()).toBeTruthy();
    });

    it('should render initial state of the component', () => {
      expect(wrapper.element).toMatchSnapshot();
    });
  });

  describe('computed', () => {
    describe('statusClass', () => {
      it('should return correct statusClass', () => {
        expect(wrapper.vm.statusClass).toBe('is-danger');

        wrapper = wrapperFactory({
          computed: {
            appStatus: 'syncing',
          },
        });
        expect(wrapper.vm.statusClass).toBe('is-warning');

        wrapper = wrapperFactory({
          computed: {
            appStatus: 'ready',
          },
        });
        expect(wrapper.vm.statusClass).toBe('is-success');
        state.modules.connectionStatus.state.isApiConnecting = false;
        state.modules.connectionStatus.getters.appStatus = () => 'ready';
        const store = new Vuex.Store(state);
        wrapper = shallowMount(SyncStatus, {
          localVue,
          store,
        });
        expect(wrapper.vm.statusClass).toBe('is-warning');
      });
    });
  });
});
