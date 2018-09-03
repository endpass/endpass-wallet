import { shallow, createLocalVue } from '@vue/test-utils';

import Vuex from 'vuex';
const localVue = createLocalVue();

localVue.use(Vuex);

import QuickActions from '@/components/QuickActions';

describe('QuickActions', () => {
  describe('render', () => {
    let wrapper;
    beforeEach(() => {
      let storeOptions = {
        modules: {
          accounts: {
            namespaced: true,
            state: {
              wallet: null,
              address: null,
            },
            getters: {
              isPublicAccount: jest.fn(),
            },
          },
        },
      };
      const store = new Vuex.Store(storeOptions);
      wrapper = shallow(QuickActions, {
        localVue,
        store,
      });
    });

    it('should be a Vue component', () => {
      expect(wrapper.isVueInstance()).toBeTruthy();
    });
  });
});
