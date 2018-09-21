import { mapGetters } from 'vuex';

export default {
  computed: {
    ...mapGetters('accounts', ['isPublicAccount']),
  },

  watch: {
    isPublicAccount(newValue) {
      if (newValue) {
        this.$router.push('/');
      }
    },
  },
};
