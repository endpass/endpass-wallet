import { mapState } from 'vuex';
import { NotificationError } from '@/class';

export default {
  computed: {
    ...mapState('errors', {
      errorEmitter: state => state.errorEmitter,
    }),
  },
  methods: {
    handleError(err) {
      if (err instanceof NotificationError) {
        const { title, text, type } = err;
        this.$notify({ title, text, type });
      } else {
        console.error(err);
      }
    },
  },
  mounted() {
    this.errorEmitter.on('error', this.handleError);
  },
};
