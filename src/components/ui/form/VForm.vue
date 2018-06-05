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
};
</script>

<style lang="scss">
</style>
