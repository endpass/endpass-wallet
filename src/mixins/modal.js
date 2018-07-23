export default {
  data: () => ({
    isPasswordModal: false,
    isTwoFactorAuthModal: false,
  }),
  methods: {
    togglePasswordModal() {
      this.isPasswordModal = !this.isPasswordModal;
    },
    toggleTwoFactorAuthModal() {
      this.isTwoFactorAuthModal = !this.isTwoFactorAuthModal;
    },
  },
};
