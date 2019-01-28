import { shallowMount, createLocalVue } from '@vue/test-utils';
import ConfirmLogoutModal from '@/components/modal/ConfirmLogoutModal';

const localVue = createLocalVue();

describe('ConfirmModal', () => {
  let wrapper;

  describe('render', () => {
    beforeEach(() => {
      wrapper = shallowMount(ConfirmLogoutModal, {
        localVue,
      });
    });

    it('should be a Vue component', () => {
      expect(wrapper.name()).toBe('ConfirmLogoutModal');
      expect(wrapper.isVueInstance()).toBeTruthy();
    });

    it('should render component', () => {
      expect(wrapper.element).toMatchSnapshot();
    });
  });

  describe('behavior', () => {
    beforeEach(() => {
      wrapper = shallowMount(ConfirmLogoutModal, {
        localVue,
      });
    });

    it('should emit confirm event', () => {
      wrapper.vm.handleConfirm();

      expect(wrapper.emitted().confirm).toHaveLength(1);
    });

    it('should emit close event', () => {
      wrapper.vm.handleClose();

      expect(wrapper.emitted().close).toHaveLength(1);
    });
  });
});
