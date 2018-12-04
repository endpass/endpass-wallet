<template>
  <v-input
    :type="inputType"
    v-bind="$attrs"
    :value="value"
    :error="error"
    autocomplete="current-password"
    @input="$emit('input', $event)"
    @blur="$emit('blur', $event)"
  >
    <a
      slot="icon"
      @click="toggleVisible"
    >
      <span
        class="icon is-small is-right"
        v-html="require('@/img/eye.svg')"
      />
    </a>
  </v-input>
</template>

<script>
import VInput from '@/components/ui/form/VInput.vue';

// Wrap a VInput component to turn it into a toggleable password input
export default {
  name: 'VPassword',
  inheritAttrs: false,
  props: {
    value: {
      type: String,
      default: null,
    },
    // If true, the password is shown to the user
    visible: {
      type: Boolean,
      default: false,
    },
    error: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      isVisible: this.visible,
    };
  },
  computed: {
    inputType() {
      return this.isVisible ? 'text' : 'password';
    },
  },
  methods: {
    toggleVisible() {
      this.isVisible = !this.isVisible;
    },
  },
  components: {
    VInput,
  },
};
</script>

<style lang="scss">
.control {
  &.has-icons-left,
  &.has-icons-right {
    .icon {
      pointer-events: initial;
    }
  }
}
</style>
