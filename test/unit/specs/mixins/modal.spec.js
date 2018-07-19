import modalMixin from '@/mixins/modal';

describe('Modal mixin', () => {
  describe('data', () => {
    it('should return correct data', () => {
      const data = modalMixin.data();
      const expected = {
        isPasswordModal: false,
        isTwoFactorAuthModal: false,
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

    describe('toggleTwoFactorAuthModal', () => {
      it('should toggle modal window for two factor auth', () => {
        const { toggleTwoFactorAuthModal } = modalMixin.methods;
        const context = {
          isTwoFactorAuthModal: false,
        };

        toggleTwoFactorAuthModal.call(context);
        expect(context.isTwoFactorAuthModal).toBeTruthy();

        toggleTwoFactorAuthModal.call(context);
        expect(context.isTwoFactorAuthModal).toBeFalsy();
      });
    });
  });
});
