<template>
  <component
    v-pass-events="passedEvents"
    :is="currentModal"
    :is-loading="isLoading"
    class="login-modal"
    data-test="login-modal"
  />
</template>

<script>
import { mapActions } from 'vuex';

import LoginModalModes from '@/components/modal/LoginModalModes';
import error from '@/mixins/error';

export default {
  name: 'LoginModal',
  data: () => ({
    currentModal: LoginModalModes.name,
    isLoading: false,
    email: null,
    passedEvents: {
      confirm: {
        LoginModalModes: 'handleLoginByEmail',
      },
      close: 'handleClose',
    },
  }),
  methods: {
    ...mapActions('user', ['login']),
    ...mapActions({
      reloadData: 'init',
    }),
    async handleLoginByEmail({ mode }) {
      try {
        this.isLoading = true;
        await this.login({ mode });

        this.handleSuccessfulLogin();
      } catch (e) {
        this.handleFailedLogin(e);
      } finally {
        this.isLoading = false;
      }
    },
    handleClose() {
      this.close();
    },
    handleSuccessfulLogin() {
      this.close();

      // this.$notify({
      //   title: 'Welcome',
      //   type: 'is-info',
      //   text: 'Check you email address for success login',
      // });

      this.$ga.event({
        eventCategory: 'onboarding',
        eventAction: 'login_success',
      });
    },
    handleFailedLogin(err) {
      this.emitError(err);
      this.$ga.event({
        eventCategory: 'onboarding',
        eventAction: 'login_fail',
      });
    },
    close() {
      this.$emit('close');
    },
  },
  mixins: [error],
  components: {
    LoginModalModes,
  },
};
</script>
