<template>
  <form :id="id">
    <slot />
  </form>
</template>

<script>
export default {
  name: 'v-form',
  props: {
    id: {
      type: String,
      default: null,
    },
  },
  provide() {
    const form = {};
    Object.defineProperty(form, 'isFormValid', {
      enumerable: true,
      get: () => this.isFormValid,
    });
    return { form };
  },
  computed: {
    isFormValid() {
      return !this.errors.count();
    },
  },
  methods: {
    validateFrom() {
      this.$emit('formValid', this.isFormValid());
    }
  }
};
</script>

<style lang="scss">
</style>
