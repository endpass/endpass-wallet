<template>
  <div class="field">
    <label class="checkbox">
      <input
        type="checkbox"
        :name="name"
        :data-vv-as="name"
        v-validate="validator"
        :class="{'is-danger': error || errors.has(name) }"
        v-model="innerValue"
      />
      <slot />
    </label>
  </div>
</template>

<script>
export default {
  name: 'v-checkbox',
  props: {
    value: {
      type: Boolean,
      default: false,
    },
    name: {
      type: String,
      default: 'checkbox'
    },
    disabled: {
      type: Boolean,
      default: false
    },
    error: {
      type: String,
      default: null
    },
    validator: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      innerValue: this.value,
    };
  },
  inject: {
    $validator: '$validator',
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
