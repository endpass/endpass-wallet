import { shallow } from '@vue/test-utils';

import ImportWalletFromJson from '@/components/importWallet/ImportWalletFromJson';

describe('ImportWalletFromJson', () => {
  describe('render', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = shallow(ImportWalletFromJSON, {
      });
    });

    it('should be a Vue component', () => {
      expect(wrapper.isVueInstance()).toBeTruthy();
    });
  });

});
