import { shallow, createLocalVue } from '@vue/test-utils';

import Vuex from 'vuex';
const localVue = createLocalVue();

localVue.use(Vuex);

import SyncStatus from '@/components/bar/SyncStatus';

describe('SyncStatus', () => {
  let wrapper;
  beforeEach(() => {
    const store = new Vuex.Store({
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
        },
      },
    });
    wrapper = shallow(SyncStatus, {
      localVue,
      store,
    });
  });
  describe('render', () => {
    it('should be a Vue component', () => {
      expect(wrapper.name()).toBe('sync-status');
      expect(wrapper.isVueInstance()).toBeTruthy();
    });

    it('should render initial state of the component', () => {
      expect(wrapper.element).toMatchSnapshot();
    });
  });

  describe('computed', () => {
    it('should return correct statusClass', () => {
      expect(wrapper.vm.statusClass).toBe('is-danger');
      wrapper.setComputed({ appStatus: 'syncing' });
      expect(wrapper.vm.statusClass).toBe('is-warning');
      wrapper.setComputed({ appStatus: 'ready' });
      expect(wrapper.vm.statusClass).toBe('is-success');
    });
  });
});
