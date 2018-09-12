<template>
  <div class="field">
    <label class="checkbox">
      <input
        v-validate="validator"
        :name="name"
        :data-vv-as="name"
        :class="{'is-danger': error || errors.has(name) }"
        v-model="innerValue"
        type="checkbox"
      >
      <slot />
    </label>
  </div>
</template>

<script>
export default {
  name: 'VCheckbox',
  inject: {
    $validator: '$validator',
  },
  props: {
    value: {
      type: Boolean,
      default: false,
    },
    name: {
      type: String,
      default: 'checkbox',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    error: {
      type: String,
      default: null,
    },
    validator: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      innerValue: this.value,
    };
  },
  watch: {
    value(value) {
      this.innerValue = value;
    },
    innerValue(value) {
      this.$emit('input', value);
    },
  },
};
</script>
