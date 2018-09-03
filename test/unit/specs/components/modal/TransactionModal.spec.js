import { shallow } from '@vue/test-utils';
import { Transaction } from '@/class';

import TransactionModal from '@/components/modal/TransactionModal';

describe('TransactionModal', () => {
  describe('render', () => {
    let wrapper;

    beforeEach(() => {
      const transaction = new Transaction({
        data: '0x0',
        from: '0x0',
        from: '0x0',
      });
      wrapper = shallow(TransactionModal, {
        propsData: {
          transaction,
        },
      });
    });

    it('should be a Vue component', () => {
      expect(wrapper.isVueInstance()).toBeTruthy();
    });
  });
});
