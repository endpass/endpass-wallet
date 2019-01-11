<template>
  <v-modal
    class="is-dark"
    @close="handleClose"
  >
    <template slot="header">Check Your Email</template>

    <p class="subtitle">We just sent you an email with a confirmation link.
    Click it to instantly log in to your wallet!</p>
  </v-modal>
</template>

<script>
export default {
  name: 'ConfirmEmailModal',
  methods: {
    handleClose() {
      this.$emit('close');
    },
  },
};
</script>
