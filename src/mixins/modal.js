export default {
  data: () => ({
    isPasswordModal: false,
  }),
  methods: {
    togglePasswordModal() {
      this.isPasswordModal = !this.isPasswordModal;
    },
  },
};
