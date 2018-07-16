<template>
  <div class="field">
    <label class="label"
           v-if="label"
           :for="id">{{ label }}</label>
    <div class="control">
      <textarea
        v-model="innerValue"
        class="textarea"
        v-bind="getTextareaProps()"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'v-textarea',
  props: {
    value: {
      type: [String, Number],
      default: null,
    },
    id: {
      type: String,
      default: null,
    },
    label: {
      type: String,
      default: null,
    },
    placeholder: {
      type: String,
      default: null,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      innerValue: this.value,
      ignoreProps: ['label'],
    };
  },
  methods: {
    getTextareaProps() {
      return Object.keys(this.$props).reduce((accumulator, prop) => {
        if (!this.ignoreProps.includes(prop)) {
          accumulator[prop] = this.$props[prop];
        }

        return accumulator;
      }, {});
    },
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
