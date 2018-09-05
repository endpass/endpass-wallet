<template>
  <div class="field">
    <label class="label"
           v-if="label">{{ label }}</label>
    <div class="control select">
      <select v-model="selected" :name="name"
      :data-vv-as="label || name" v-validate="validator">
        <option v-for="item in options"
                :key="item.key || item.val || item"
                :value="getOptionParameter(item, 'val')">{{ getOptionParameter(item, 'text') }}</option>
      </select>
    </div>
    <p class="help is-danger"
       v-if="error || errors && errors.has(name) ">{{ error || errors && errors.first(name) }}</p>
  </div>
</template>

<script>
import getOptionParameter from '@/utils/getOptionParameter';

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
  },
};
</script>

<style lang="scss">
.select {
  &:not(.is-multiple):not(.is-loading)::after {
    border-color: $primary;
  }
  .field .is-naked &,
  form .is-naked &,
  .modal .is-naked & {
    select {
      background-color: transparent;
      color: $white;
      border: none;
      &.is-active,
      &:active,
      &.is-focused,
      &:focus {
        border: 1px solid $white;
        box-shadow: none;
      }
    }
    &::after,
    &:hover::after {
      border-color: $white;
    }
  }
}
</style>
