<template>
  <div class="field">
    <label class="label"
           v-if="label">{{ label }}</label>
    <div class="control select">
      <select v-model="selected" :name="name"
      :data-vv-as="label || name" v-validate="validator">
        <option v-for="item in options"
                :key="item.val || item"
                :value="item.val || item">{{ item.text || item }}</option>
      </select>
    </div>
    <p class="help is-danger"
       v-if="error || errors && errors.has(name) ">{{ error || errors && errors.first(name) }}</p>
  </div>
</template>

<script>
export default {
  name: 'v-select',
  props: {
    value: {
      default: null,
    },
    validator: {
      type: String,
      default: '',
    },
    error: {
      type: String,
      default: null,
    },
    name: {
      type: String,
      default: '',
    },
    options: {
      type: Array,
      default: () => [],
    },
    label: {
      type: String,
      default: null,
    },
  },
  inject: {
    $validator: '$validator',
  },
  computed: {
    selected: {
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
</style>
