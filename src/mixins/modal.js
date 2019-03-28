export default {
  data: () => ({
    isPasswordModal: false,
    isTwoFactorAuthModal: false,
    isLoginModal: false,
    isConfirmLogoutModal: false,
    isConfirmModal: false,
  }),
  methods: {
    togglePasswordModal() {
      this.isPasswordModal = !this.isPasswordModal;
    },
    toggleTwoFactorAuthModal() {
      this.isTwoFactorAuthModal = !this.isTwoFactorAuthModal;
    },
    toggleLoginModal() {
      this.isLoginModal = !this.isLoginModal;
    },
    toggleConfirmLogoutModal() {
      this.isConfirmLogoutModal = !this.isConfirmLogoutModal;
    },
    toggleConfirmModal() {
      this.isConfirmModal = !this.isConfirmModal;
    },
  },
};
