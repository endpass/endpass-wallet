import { shallow } from '@vue/test-utils';

import ConfirmEmailModal from '@/components/modal/ConfirmEmailModal';

describe('ConfirmEmailModal', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallow(ConfirmEmailModal, {});
  });

  describe('render', () => {
    it('should be a Vue component', () => {
      expect(wrapper.isVueInstance()).toBeTruthy();
    });

    it('should match snapshot', () => {
      expect(wrapper.element).toMatchSnapshot();
    });
  });

  describe('methods', () => {
    describe('handleClose', () => {
      it('should trigger "close" event', () => {
        wrapper.vm.handleClose();

        expect(wrapper.emitted().close).toEqual([[]]);
      });
    });
  });
});
