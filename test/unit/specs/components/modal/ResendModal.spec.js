import { shallowMount, createLocalVue } from '@vue/test-utils';
import { TransactionFactory } from '@/class';
import VeeValidate from 'vee-validate';
import UIComponents from '@endpass/ui';

import ResendModal from '@/components/modal/ResendModal';
import validation from '@/validation';

const localVue = createLocalVue();

localVue.use(VeeValidate);
localVue.use(validation);
localVue.use(UIComponents);

describe('ResendModal', () => {
  let wrapper;

  beforeEach(() => {
    const transaction = TransactionFactory.fromSendForm({
      data: '0x0',
      from: '0x0',
      gasPrice: 90,
    });
    wrapper = shallowMount(ResendModal, {
      localVue,
      propsData: {
        transaction,
      },
      sync: false,
    });
  });

  describe('render', () => {
    it('should be a Vue component', () => {
      expect(wrapper.name()).toBe('ResendModal');
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
        expect(wrapper.emitted().confirm[0][0]).toMatchObject({
          ...wrapper.vm.transaction,
          gasPrice: 91,
        });
      });
    });
  });
});
