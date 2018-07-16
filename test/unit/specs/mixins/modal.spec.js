import modalMixin from '@/mixins/modal';

describe('Modal mixin', () => {
  describe('data', () => {
    it('should return correct data', () => {
      const data = modalMixin.data();
      const expected = {
        isPasswordModal: false,
      };

      expect(data).toEqual(expected);
    });
  });

  describe('methods', () => {
    describe('togglePasswordModal', () => {
      it('should toggle modal window for password confirmation', () => {
        const { togglePasswordModal } = modalMixin.methods;
        const context = {
          isPasswordModal: false,
        };

        togglePasswordModal.call(context);
        expect(context.isPasswordModal).toBeTruthy();

        togglePasswordModal.call(context);
        expect(context.isPasswordModal).toBeFalsy();
      });
    });
  });
});
