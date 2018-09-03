import { shallow } from '@vue/test-utils';

import ConfirmEmailModal from '@/components/modal/ConfirmEmailModal';

describe('ConfirmEmailModal', () => {
  describe('render', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = shallow(ConfirmEmailModal, {});
    });

    it('should be a Vue component', () => {
      expect(wrapper.isVueInstance()).toBeTruthy();
    });
  });
});
