<template>
  <div class="field">
    <div class="control">
      <a :id="id"
         :disabled="!form.isFormValid || disabled"
         class="button"
         :class="[...classes, {'is-loading' : loading }]"
         @click.prevent="$emit('click', $event)">
        <slot />
      </a>
    </div>
  </div>
</template>

<script>
export default {
  name: 'v-button',
  inject: {
    form: {
      default: () => ({
        isFormValid: true,
      }),
    },
  },
  props: {
    id: {
      type: String,
      default: null,
    },
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
