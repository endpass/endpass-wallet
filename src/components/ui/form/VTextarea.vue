<template>
  <div class="field">
    <label
      v-if="label"
      class="label"
    >
      {{ label }}
    </label>
    <div class="control">
      <textarea
        :value="innerValue"
        v-bind="$attrs"
        class="textarea"
        v-on="listeners"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'VTextarea',
  props: {
    value: {
      type: [String, Number],
      default: null,
    },
    label: {
      type: String,
      default: null,
    },
  },
  computed: {
    innerValue: {
      get() {
        return this.value;
      },
      set(newVal) {
        this.$emit('input', newVal);
      },
    },
    listeners() {
      return {
        ...this.$listeners,
        input: event => this.$emit('input', event.target.value),
      };
    },
  },
  inheritAttrs: false,
};
</script>
