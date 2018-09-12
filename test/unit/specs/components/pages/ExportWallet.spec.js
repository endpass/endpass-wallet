import { shallow } from '@vue/test-utils';
import Vuex from 'vuex';
import { generateStubs } from '@/utils/testUtils';

import ExportWallet from '@/components/pages/ExportWallet';

describe('ExportWallet page', () => {
  let wrapper;
  beforeEach(() => {
    const store = new Vuex.Store({
      state: {
        accounts: {},
      },
    });
    wrapper = shallow(ExportWallet, {
      store,
      stubs: generateStubs(ExportWallet),
    });
  });

  describe('render', () => {
    it('should be a Vue component', () => {
      expect(wrapper.name()).toBe('export-wallet');
      expect(wrapper.isVueInstance()).toBeTruthy();
    });

    it('should render initial state of the component', () => {
      expect(wrapper.element).toMatchSnapshot();
    });

    it('should display correct components depending on export type', () => {
      wrapper.setData({
        exportType: 'privateKey',
      });
      expect(wrapper.find('export-to-private-key').exists()).toBe(true);
      expect(wrapper.find('export-to-json').exists()).toBe(false);
      wrapper.setData({
        exportType: 'json',
      });
      expect(wrapper.find('export-to-json').exists()).toBe(true);
      expect(wrapper.find('export-to-private-key').exists()).toBe(false);
      wrapper.setData({
        exportType: 'seedPhrase',
      });
      expect(wrapper.find('export-to-json').exists()).toBe(false);
      expect(wrapper.find('export-to-private-key').exists()).toBe(false);
      //type is unsupportable message
      expect(wrapper.find('.subtitle').exists()).toBe(true);
    });
  });
});
