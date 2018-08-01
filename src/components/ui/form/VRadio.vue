<template lang="html">
  <div class="field">
    <div class="control">
      <label class="label"
             v-if="label">{{ label }}</label>
      <template v-for="option in options"
              :key="item.key || item.val || item">
        <label class="label" >{{ getOptionParameter(item, 'text') }}</label>
        <input v-model="selected" :id="id + item.key || item.val || item" type="radio" :name="name" :value="getOptionParameter(option, 'val')">
      </template>
      <p class="help is-danger"
         v-if="error || errors && errors.has(name) ">{{ error || errors && errors.first(name) }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'v-radio',
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
    error: {
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
  methods: {
    getOptionParameter: (item, value) => item instanceof Object ? item[value] : item
  },
};
</script>

<style lang="css">
</style>
