import { shallowMount, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import ExportWallet from '@/components/pages/ExportWallet';

const localVue = createLocalVue();

localVue.use(Vuex);

describe('ExportWallet page', () => {
  let wrapper;
  let store;

  beforeEach(() => {
    store = new Vuex.Store({
      modules: {
        accounts: {
          namespaced: true,
          getters: {
            wallet: () => null,
            isPublicAccount: () => false,
          },
        },
      },
    });
    wrapper = shallowMount(ExportWallet, {
      localVue,
      store,
    });
  });

  describe('render', () => {
    it('should be a Vue component', () => {
      expect(wrapper.name()).toBe('ExportWallet');
      expect(wrapper.isVueInstance()).toBeTruthy();
    });

    it('should render initial state of the component', () => {
      expect(wrapper.element).toMatchSnapshot();
    });

    it('should display correct components depending on export type', () => {
      wrapper.setData({
        exportType: 'privateKey',
      });
      expect(wrapper.find('export-to-private-key-stub').exists()).toBe(true);
      expect(wrapper.find('export-to-json-stub').exists()).toBe(false);
      wrapper.setData({
        exportType: 'json',
      });
      expect(wrapper.find('export-to-json-stub').exists()).toBe(true);
      expect(wrapper.find('export-to-private-key-stub').exists()).toBe(false);
      wrapper.setData({
        exportType: 'seedPhrase',
      });
      expect(wrapper.find('export-to-json-stub').exists()).toBe(false);
      expect(wrapper.find('export-to-private-key-stub').exists()).toBe(false);
      // type is unsupportable message
      expect(wrapper.find('.subtitle').exists()).toBe(true);
    });
  });
});
