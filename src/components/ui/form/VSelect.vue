<template>
  <div class="field">
    <label v-if="label" class="label">{{ label }}</label>
    <div class="control select">
      <select
        v-validate="validator"
        v-model="selected"
        :disabled="disabled"
        :name="name"
        :data-vv-as="label || name"
      >
        <option
          v-for="item in options"
          :key="item.key || item.val || item"
          :value="getOptionParameter(item, 'val')"
        >{{ getOptionParameter(item, 'text') }}</option>
      </select>
    </div>
    <p
      v-if="error || errors && errors.has(name) "
      class="help is-danger"
    >{{ error || errors && errors.first(name) }}</p>
  </div>
</template>

<script>
import getOptionParameter from '@/utils/getOptionParameter';

export default {
  name: 'VSelect',
  inject: {
    $validator: '$validator',
  },
  props: {
    value: {
      type: [String, Number],
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
    disabled: {
      type: Boolean,
      default: false,
    },
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
