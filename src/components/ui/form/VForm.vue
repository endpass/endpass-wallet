<template>
  <form
    class="control"
    @submit.prevent="submit"
  >
    <slot />
  </form>
</template>

<script>
export default {
  name: 'VForm',
  props: {
    isFormValid: {
      type: Boolean,
      default: true,
    },
  },
  methods: {
    submit() {
      if (this.isFormValid) {
        this.$emit('submit');
      }
    },
  },
};
</script>

<style lang="scss">
</style>
