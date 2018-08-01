<template>
  <div class="field">
    <div class="control">
      <button :id="id" @click="$emit('click',$event)"
         :disabled="!form.isFormValid || disabled"
         class="button"
         :type="type"
         :class="[...classes, {'is-loading' : loading }]">
        <slot />
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'v-button',
  inject: {
    $validator: '$validator',
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
    type: {
      type: String,
      default: 'submit'
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
  }
};
</script>

<style lang="scss">
</style>
