<template>
  <div class="field">
    <div class="control">
      <button
        v-bind="$attrs"
        :disabled="disabled"
        :class="[...classes, {'is-loading' : loading }]"
        class="button"
        v-on="$listeners"
      >
        <slot />
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VButton',
  inheritAttrs: false,
  props: {
    className: {
      type: String,
      default: '',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    classes() {
      return this.className.split(' ');
    },
  },
};
</script>

<style lang="scss">
</style>
