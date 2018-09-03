import { shallow } from '@vue/test-utils';
import { Transaction } from '@/class';

import ResendModal from '@/components/modal/ResendModal';

describe('ResendModal', () => {
  describe('render', () => {
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

    it('should be a Vue component', () => {
      expect(wrapper.isVueInstance()).toBeTruthy();
    });

    it('should emit close event with new transaction', () => {
      const transaction = wrapper.vm.confirmResend();

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
