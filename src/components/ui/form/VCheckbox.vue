<template>
  <div class="field">
    <label class="checkbox">
      <input
        type="checkbox"
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
