<template lang="html">
  <div class="field is-horizontal has-addons v-radio">
    <label class="label"
           v-if="label">{{ label }}</label>
    <div class="control" :key="'label' + getKeyString(option)"  v-for="option in options">
      <label
        :class="{'is-info is-selected': getOptionParameter(option, 'val') === value}"
        class="button is-multiline" :for="id + getKeyString(option)"
      >
          {{ getOptionParameter(option, 'key') }}
          <span v-if="option.help" class="help">{{option.help}}</span>
      </label>
      <input v-model="selected" :id="id + getKeyString(option)" type="radio" :name="name" :value="getOptionParameter(option, 'val')">
    </div>
    <p class="help is-danger"
       v-if="error || errors && errors.has(name) ">{{ error || errors && errors.first(name) }}</p>
  </div>
</template>

<script>
import getOptionParameter from '@/utils/getOptionParameter';

export default {
  name: 'v-radio',
  props: {
    value: {
      default: null,
    },
    id: {
      type: String,
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
    getOptionParameter,
    getKeyString: item => item.key || item.val || item,
  },
};
</script>

<style lang="css">
.v-radio input {
  display: none;
}
</style>
