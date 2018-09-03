import { shallow, createLocalVue } from '@vue/test-utils';

import Vuex from 'vuex';
const localVue = createLocalVue();

localVue.use(Vuex);

import SyncStatus from '@/components/bar/SyncStatus';

describe('SyncStatus', () => {
  describe('render', () => {
    let wrapper;
    beforeEach(() => {
      let storeOptions = {
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
      };
      const store = new Vuex.Store(storeOptions);
      wrapper = shallow(SyncStatus, {
        localVue,
        store,
      });
    });

    it('should be a Vue component', () => {
      expect(wrapper.isVueInstance()).toBeTruthy();
    });

    it('should render data from vuex', () => {
      const tag = wrapper.find('.tag');
      expect(tag.element.title).toBe('synced to block 1');
      expect(tag.classes()).toContain('is-danger');
      expect(tag.text()).toContain('failed');
    });
  });
});
