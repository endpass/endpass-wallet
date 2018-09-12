<template>
  <div class="field">
    <div class="control">
      <button
        v-bind="$attrs"
        :disabled="!form.isFormValid || disabled"
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
  inject: {
    $validator: '$validator',
    form: {
      default: () => ({
        isFormValid: true,
      }),
    },
  },
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
  inheritAttrs: false,
};
</script>

<style lang="scss">
</style>
