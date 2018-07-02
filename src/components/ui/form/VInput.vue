<template>
  <div class="field">
    <label class="label"
           v-if="label"
           :for="id">{{ label }}</label>
    <div class="field"
         :class="{'has-addons': $slots.addon }">
      <div class="control"
           :class="{'is-expanded': $slots.addon }">
        <input v-model="innerValue"
              v-validate="validator"
               @blur="$emit('blur', $event.target.value)"
               class="input"
               :class="{'is-danger': error || errors.has(name) }"
               v-bind="props">
      </div>
      <div class="control"
           v-if="$slots.addon">
        <slot name="addon" />
      </div>
    </div>
    <p class="help is-danger"
       v-if="error || errors.has(name) ">{{ error || errors.first(name) }}</p>
  </div>
</template>

<script>
export default {
  name: 'v-input',
  props: {
    value: {
      type: [String, Number],
      default: null,
    },
    id: {
      type: String,
      default: null,
    },
    type: {
      type: String,
      default: 'text',
    },
    name: {
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
    validator: {
      type: String,
      default: false,
    },
    ariaDescribedby: {
      type: String,
      default: null,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    required: {
      type: Boolean,
      default: false,
    },
    error: {
      type: String,
      default: null,
    },
    autocomplete: {
      type: String,
      default: null,
    },
  },
  methods: {
    camelToKebab: str => str.replace(/([A-Z])/g, g => `-${g[0].toLowerCase()}`),
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
    props() {
      return Object.keys(this.$props).reduce(
        (res, prop) => ({
          ...res,
          [this.camelToKebab(prop)]: this.$props[prop],
        }),
        {}
      );
    },
  },
};
</script>

<style lang="scss">
.field.has-addons {
  margin-bottom: 0;
}

.field > .field {
  margin-bottom: 0;
}
</style>
