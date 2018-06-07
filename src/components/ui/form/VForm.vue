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
      default: '',
    },
  },
  computed: {
    isFormValid() {
      const { fields, errors } = this.$parent;

      if (!(fields || errors)) {
        return true;
      }

      const hasInvalidField = Object.keys(fields).some(
        field =>
          fields[field] && fields[field].invalid
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
