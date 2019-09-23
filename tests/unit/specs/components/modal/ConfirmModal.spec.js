import { shallowMount, createLocalVue } from '@vue/test-utils';
import UIComponents from '@endpass/ui';
import setupI18n from '@/locales/i18nSetup';
import ConfirmModal from '@/components/modal/ConfirmModal';

const localVue = createLocalVue();
const i18n = setupI18n(localVue);

localVue.use(UIComponents);

describe('ConfirmModal', () => {
  let wrapper;

  describe('render', () => {
    beforeEach(() => {
      wrapper = shallowMount(ConfirmModal, {
        localVue,
        i18n,
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
      wrapper = shallowMount(ConfirmModal, {
        localVue,
        i18n,
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
