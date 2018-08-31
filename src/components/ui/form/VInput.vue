<template>
  <div class="field">
    <label class="label"
           :class="{'has-text-danger': error || errors.has(name) }"
           v-if="label"
           :for="$attrs.id">{{ label }}</label>
    <div class="field"
         :class="{'has-addons': $slots.addon }">
      <div class="control"
           :class="{'is-expanded': $slots.addon, 'has-icons-right': $slots.icon }">
        <input :value="innerValue"
               v-validate="validator"
               :data-vv-as="name"
               @blur="$emit('blur', $event.target.value)"
               class="input"
               :class="{'is-danger': error || errors.has(name) }"
               v-bind="$attrs"
               v-on="listeners"
               >
        <slot name="icon"></slot>
      </div>
      <div class="control"
           v-if="$slots.addon">
        <slot name="addon" />
      </div>
    </div>
    <p class="help is-danger"
       v-if="error || errors.has(name) ">{{ error || errors.first(name) }}</p>
    <p class="help" v-else-if="help">{{ help }}</p>
  </div>
</template>

<script>
export default {
  name: 'v-input',
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
    help: {
      type: String,
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
  },
  inject: {
    $validator: '$validator',
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
    name() {
      return this.$attrs.name || this.label;
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

<style lang="scss">
.field.has-addons {
  margin-bottom: 0;
  .control:last-child {
    .button.is-static,
    .input,
    .select select {
      border: none;
      outline: none;
      //border-bottom: 1px solid $dark-grey;
    }
  }
}

.field > .field {
  margin-bottom: 0;
}

.label {
  color: $medium-grey;
  font-family: $heading-font-family;
}

.help {
  font-size: 0.85rem;
  margin-top: 0.15rem;
}

.input,
.textarea {
  box-shadow: none;
  border: none;
  outline: none;
  border-radius: 0;
  padding: 0;
  border-bottom: 1px solid $dark-grey;
  transition: box-shadow 0.4s, border 0.4s;

  &:hover,
  &.is-hovered {
    border-bottom: 1px solid $primary;
    box-shadow: 0 1px 0 0 $primary;
  }

  &:focus,
  &.is-focused,
  &:active,
  &.is-active {
    border-bottom: 1px solid $primary;
    box-shadow: 0 1px 0 0 $primary;
    font-weight: 700;
  }
  &.is-danger:focus,
  &.is-danger.is-focused,
  &.is-danger:active,
  &.is-danger.is-active,
  &.is-danger:hover,
  &.is-danger.is-hovered {
    border-bottom: 1px solid $danger;
    box-shadow: 0 1px 0 0 $danger;
  }

  .field .is-naked &,
  form .is-naked &,
  .modal .is-naked & {
    background-color: transparent;
    border-bottom-width: 2px;
    border-bottom-color: $white;
    &::placeholder {
      color: $medium-grey;
    }
  }
}
</style>
