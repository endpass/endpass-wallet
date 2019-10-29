<template>
  <div class="code-requester">
    <span>{{ $t('components.twoFactorAuthModal.didNotGetCode') }}</span>
    <a class="link" @click="requestCode">
      {{ $t('components.twoFactorAuthModal.resendCode') }}
    </a>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';

export default {
  name: 'CodeRequester',

  data: () => ({
    isLoading: false,
  }),

  computed: {
    ...mapState('user', ['email']),
  },

  methods: {
    ...mapActions('user', ['sendCode']),

    async requestCode() {
      if (this.isLoading) return;

      this.isLoading = true;

      await this.sendCode(this.email);

      this.isLoading = false;
    },
  },

  async mounted() {
    await this.requestCode();
  },
};
</script>

<style lang="scss">
.code-requester {
  text-align: center;
}
</style>
