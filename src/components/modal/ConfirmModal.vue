<template>
  <v-modal
    class="is-dark"
    @close="handleClose"
  >
    <template slot="header">Are you sure?</template>

    <slot />

    <div
      slot="footer"
      class="buttons"
    >
      <v-button
        class-name="is-primary is-medium"
        data-test="submit-logout"
        @click="handleConfirm"
      >
        Confirm
      </v-button>
      <v-button
        class-name="is-medium"
        data-test="submit-logout"
        @click="handleClose"
      >
        Cancel
      </v-button>
    </div>
  </v-modal>
</template>

<script>
import VModal from '@/components/ui/VModal';
import VButton from '@/components/ui/form/VButton';

export default {
  name: 'ConfirmModal',
  methods: {
    handleConfirm() {
      this.$emit('confirm');
    },
    handleClose() {
      this.$emit('close');
    },
  },
  components: {
    VButton,
    VModal,
  },
};
</script>
