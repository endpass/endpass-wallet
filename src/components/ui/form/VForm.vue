<template>
  <form class="control" @submit.prevent="submit">
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
  computed: {
    isFormValid() {
      const { fields, errors } = this;

      if (!(fields || errors)) {
        return true;
      }

      const hasInvalidField = Object.keys(fields).some(
        field => fields[field] && fields[field].invalid,
      );

      return !(hasInvalidField || errors.any());
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
  methods: {
    submit() {
      if (this.isFormValid) {
        this.$emit('submit');
      } else {
        this.$notify({
          title: 'Form invalid',
          text: 'Please correct errors.',
          type: 'is-warning',
        });
      }
    },
    validateFrom() {
      this.$emit('formValid', this.isFormValid());
    },
  },
};
</script>

<style lang="scss">
</style>
