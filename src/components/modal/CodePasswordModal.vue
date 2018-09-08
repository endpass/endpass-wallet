<template>
  <password-modal
    @confirm="emitConfirm"
    @close="emitClose"
  >
    <div class="field">
      <label
        v-if="label"
        class="label"
      >
        {{ label }}
      </label>
      <p class="code">{{ code }}</p>
    </div>
  </password-modal>
</template>

<script>
import PasswordModal from '@/components/modal/PasswordModal';

export default {
  name: 'CodePasswordModal',

  components: {
    PasswordModal,
  },

  props: {
    label: {
      type: String,
      required: false,
      default: null,
    },

    code: {
      type: String,
      required: true,
    },
  },

  methods: {
    emitConfirm(data) {
      this.$emit('confirm', data);
    },

    emitClose() {
      this.$emit('close');
    },
  },
};
</script>
