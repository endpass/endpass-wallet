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

        if (err.log) {
          console.error(err.message);
        }
      } else if (!(err.response && err.response.status === 401)) {
        console.error(err);
      }
    },
  },
  mounted() {
    this.errorEmitter.on('error', this.handleError);
  },
};
