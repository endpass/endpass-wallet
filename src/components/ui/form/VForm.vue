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
      // const { fields, errors } = this;
      //
      // if (!(fields || errors)) {
      //   return true;
      // }
      //
      // const hasInvalidField = Object.keys(fields).some(
      //   field => fields[field] && fields[field].invalid
      // );

      return this.errors && !this.errors.any();
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
