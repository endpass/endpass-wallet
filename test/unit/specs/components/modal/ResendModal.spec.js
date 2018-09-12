import { shallow } from '@vue/test-utils';
import { Transaction } from '@/class';

import ResendModal from '@/components/modal/ResendModal';

describe('ResendModal', () => {
  let wrapper;

  beforeEach(() => {
    const transaction = new Transaction({
      data: '0x0',
      from: '0x0',
      from: '0x0',
    });
    wrapper = shallow(ResendModal, {
      propsData: {
        transaction,
      },
    });
  });

  describe('render', () => {
    it('should be a Vue component', () => {
      expect(wrapper.name()).toBe('resend-modal');
      expect(wrapper.isVueInstance()).toBeTruthy();
    });

    it('should render initial state of the component', () => {
      expect(wrapper.element).toMatchSnapshot();
    });
  });

  describe('methods', () => {
    describe('confirmResend', () => {
      it('should emit close event with new transaction', () => {
        wrapper.vm.confirmResend();
        expect(wrapper.emitted().confirm).toBeTruthy();
        expect(wrapper.emitted().confirm[0][0]).toMatchObject(
          new Transaction({
            data: '0x0',
            from: '0x0',
            from: '0x0',
          }),
        );
      });
    });
  });
});
