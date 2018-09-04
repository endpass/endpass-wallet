<template>
  <div class="field">
    <label class="label"
           v-if="label"
           >{{ label }}</label>
    <div class="control">
      <textarea
        :value="innerValue"
        class="textarea"
        v-bind="$attrs"
        v-on="listeners"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'v-textarea',
  inheritAttrs: false,
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
};
</script>
