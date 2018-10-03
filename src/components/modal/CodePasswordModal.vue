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

  props: {
    label: {
      type: String,
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

  components: {
    PasswordModal,
  },
};
</script>
