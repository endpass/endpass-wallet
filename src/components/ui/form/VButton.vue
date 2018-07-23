<template>
  <div class="field">
    <div class="control">
      <a :id="id"
         :disabled="!form.isFormValid || disabled"
         class="button"
         :class="[...classes, {'is-loading' : loading }]"
         @click.prevent="processClick">
        <slot />
      </a>
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
  methods: {
    processClick($event) {
      if (this.form.isFormValid) {
        this.$emit('click', $event);
        return;
      }
      this.$notify({
        title: 'Form invalid',
        text: 'Please correct errors.',
        type: 'is-warning',
      });
    },
  },
};
</script>

<style lang="scss">
</style>
