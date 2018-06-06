<template>
  <div class="field">
    <label class="label"
           v-if="label"
           :for="id">{{ label }}</label>
    <div class="field has-addons"
         :class="{'has-addons': $slots.addon }">
      <div class="control"
           :class="{'is-expanded': $slots.addon }">
        <input v-model="innerValue"
               @blur="$emit('blur', $event.target.value)"
               :name="name"
               :type="type"
               class="input"
               :class="{'is-danger': error }"
               :id="id"
               :aria-describedby="describe"
               :placeholder="placeholder"
               :required="required">
      </div>
      <div class="control"
           v-if="$slots.addon">
        <slot name="addon" />
      </div>
    </div>
    <p class="help is-danger"
       v-if="error">{{ error }}</p>
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
    describe: {
      type: String,
      default: null,
    },
    required: {
      type: Boolean,
      default: false,
    },
    error: {
      type: String,
      default: null,
    },
    rules: {
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
</style>
