import { mount, createLocalVue } from '@vue/test-utils';
import UIComponents from '@endpass/ui';
import validation from '@/validation';

import ConfirmEmailModal from '@/components/modal/ConfirmEmailModal';

const localVue = createLocalVue();
localVue.use(validation);
localVue.use(UIComponents);

describe('ConfirmEmailModal', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(ConfirmEmailModal, {
      localVue,
    });
  });

  describe('render', () => {
    it('should be a Vue component', () => {
      expect(wrapper.name()).toBe('ConfirmEmailModal');
      expect(wrapper.isVueInstance()).toBeTruthy();
    });

    it('should render initial state of the component', () => {
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
