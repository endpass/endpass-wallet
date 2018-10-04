import { shallow, createLocalVue } from '@vue/test-utils';
import { generateStubs } from '@/utils/testUtils';
import ConfirmModal from '@/components/modal/ConfirmModal';

const localVue = createLocalVue();

describe('ConfirmModal', () => {
  let wrapper;

  describe('render', () => {
    beforeEach(() => {
      wrapper = shallow(ConfirmModal, {
        localVue,
        stubs: generateStubs(ConfirmModal),
      });
    });

    it('should be a Vue component', () => {
      expect(wrapper.name()).toBe('ConfirmModal');
      expect(wrapper.isVueInstance()).toBeTruthy();
    });

    it('should render component', () => {
      expect(wrapper.element).toMatchSnapshot();
    });
  });

  describe('behavior', () => {
    beforeEach(() => {
      wrapper = shallow(ConfirmModal, {
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
