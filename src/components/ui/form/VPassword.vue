<template>
  <v-input :type="inputType" autocomplete="current-password" v-bind="$attrs">
  </v-input>
</template>

<script>
import VInput from '@/components/ui/form/VInput.vue';

// Wrap a VInput component to turn it into a toggleable password input
export default {
  props: {
    // If true, the password is shown to the user
    visible: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      isVisible: this.visible,
    };
  },
  methods: {
    toggleVisible() {
      this.isVisible = !this.isVisible;
    },
  },
  computed: {
    inputType() {
      return this.isVisible ? 'text' : 'password';
    },
  },
  components: {
    VInput,
  },
};
</script>
