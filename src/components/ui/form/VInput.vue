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
               @blur="$emit('blur', $event.target.value)"
               :name="name"
               :type="type"
               class="input"
               :class="{'is-danger': errors && errors.has(name) || error }"
               :id="id"
               :aria-describedby="ariaDescribedby"
               :placeholder="placeholder"
               :disabled="disabled"
               :required="required"
               :autocomplete="autocomplete" >
      </div>
      <div class="control"
           v-if="$slots.addon">
        <slot name="addon" />
      </div>
    </div>
    <p class="help is-danger"
       v-if="errors && errors.has(name) || error">{{ errors && errors.first(name) || error }}</p>
  </div>
</template>

<script>
export default {
  name: 'v-input',
  inject: ['$validator'],
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
  computed: {
    innerValue: {
      get() {
        return this.value;
      },
      set(newVal) {
        this.$emit('input', newVal);
      },
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
