import { mapActions } from 'vuex';

export default {
  methods: {
    ...mapActions('errors', ['emitError']),
  },
};
