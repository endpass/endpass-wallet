<template>
  <div class="field">
    <label
      v-if="label"
      :class="{'has-text-danger': error || errors.has($attrs.name) }"
      :for="$attrs.id"
      class="label"
    >
      {{ label }}
    </label>
    <div
      :class="{'has-addons': $slots.addon }"
      class="field"
    >
      <div
        :class="{'is-expanded': $slots.addon, 'has-icons-right': $slots.icon }"
        class="control"
      >
        <input
          v-validate="validator"
          :value="innerValue"
          :data-vv-as="$attrs['data-vv-as'] || label"
          :class="classes"
          :name="name"
          :placeholder="placeholder"
          v-bind="$attrs"
          class="input"
          @blur="$emit('blur', $event.target.value)"
          v-on="listeners"
        >
        <slot name="icon" />
      </div>
      <div
        v-if="$slots.addon"
        class="control"
      >
        <slot name="addon" />
      </div>
    </div>
    <p
      v-if="error || errors.has($attrs.name)"
      class="help is-danger"
    >
      {{ error || errors.first($attrs.name) }}
    </p>
    <p
      v-else-if="help"
      class="help"
    >
      {{ help }}
    </p>
  </div>
</template>

<script>
export default {
  name: 'VInput',
  inject: {
    $validator: '$validator',
  },
  props: {
    value: {
      type: [String, Number],
      default: null,
    },
    label: {
      type: String,
      default: null,
    },
    className: {
      type: String,
      default: '',
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
    className: {
      type: String,
      default: '',
    },
    placeholder: {
      type: String,
      required: false,
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
    name() {
      return this.$attrs.name || this.label.replace(' ', '');
    },
    listeners() {
      return {
        ...this.$listeners,
        input: event => this.$emit('input', event.target.value),
      };
    },
    classes() {
      const classes = this.className.split(' ');
      return [
        ...classes,
        { 'is-danger': this.error || this.errors.has(this.name) },
      ];
    },
  },
  inheritAttrs: false,
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
