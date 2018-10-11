<template>
  <confirm-modal
    @confirm="handleConfirm"
    @close="handleClose"
  >
    <p class="subtitle">
      This will DELETE all data in local storage permanently.
    </p>
  </confirm-modal>
</template>

<script>
import ConfirmModal from '@/components/modal/ConfirmModal';

export default {
  name: 'ConfirmLogoutModal',
  methods: {
    handleConfirm() {
      this.$emit('confirm');
    },
    handleClose() {
      this.$emit('close');
    },
  },
  components: {
    ConfirmModal,
  },
};
</script>
