<template>
  <v-modal class="is-dark" @close="handleClose">
    <template slot="header">Check Your Email</template>

    <p class="subtitle">We just sent you an email with a confirmation link.
    Click it to instantly log in to your wallet!</p>
  </v-modal>
</template>

<script>
import VModal from '@/components/ui/VModal';

export default {
  name: 'confirm-email-modal',
  methods: {
    handleClose() {
      this.$emit('close');
    },
  },
  components: {
    VModal,
  },
};
</script>
