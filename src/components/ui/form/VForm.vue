<template>
  <form :id="id">
    <slot />
  </form>
</template>

<script>
export default {
  name: 'v-form',
  inject: ['$validator'],
  provide() {
    const form = {};
    Object.defineProperty(form, 'isFormValid', {
      enumerable: true,
      get: () => this.isFormValid,
    });
    return { form };
  },
  props: {
    id: {
      type: String,
      default: null,
    },
  },
  computed: {
    isFormValid() {
      const { fields, errors } = this;

      if (!(fields || errors)) {
        return true;
      }

      const hasInvalidField = Object.keys(fields).some(
        field => fields[field] && fields[field].invalid
      );

      return !(hasInvalidField || errors.count());
    },
  },
  watch: {
    isFormValid: {
      handler(newVal) {
        this.$emit('input', newVal);
      },
      immediate: true,
    },
  },
};
</script>

<style lang="scss">
</style>
