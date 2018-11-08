<template>
  <div class="field">
    <label
      v-if="label"
      :for="id"
      class="label"
    >
      {{ label }}
    </label>
    <div
      :class="{'has-addons': $slots.addon }"
      class="field"
    >
      <div
        :class="{'is-expanded': $slots.addon,
                 'is-loading': pendingEns }"
        class="control"
      >
        <input
          v-validate="'required|ensOrAddress'"
          v-model="innerValue"
          :name="name"
          :data-vv-as="label || 'To' || name"
          :class="{'is-danger': error || errors.has(name)}"
          :disabled="disabled || pendingEns"
          v-bind="props"
          data-vv-validate-on="input"
          class="input"
        >
      </div>
      <div
        v-if="$slots.addon"
        class="control"
      >
        <slot name="addon" />
      </div>
    </div>
    <p
      v-if="error || errors.has(name) "
      class="help is-danger"
    >
      {{ error || errors.first(name) }}
    </p>
    <p
      v-if="pendingEns"
      class="help is-info"
    >
      Resolving name
    </p>
  </div>
</template>

<script>
import { kebabCase } from 'lodash';
import { ENSResolver } from '@/class';
import { mapState } from 'vuex';
import web3 from '@/utils/web3';

export default {
  name: 'VInputAddress',
  inject: {
    $validator: '$validator',
  },
  props: {
    id: {
      type: String,
      default: null,
    },
    name: {
      type: String,
      default: null,
    },
    label: {
      type: String,
      default: null,
    },
    value: {
      type: String,
      default: '',
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
  },
  data() {
    return {
      pendingEns: false,
      tempValue: '',
    };
  },
  computed: {
    innerValue: {
      get() {
        if (this.value === '') {
          return this.value;
        }

        return this.tempValue;
      },
      set(newVal) {
        const { name } = this;
        const field = this.$validator.fields.find({ name });

        if (!field) return;

        this.$validator.errors.remove(name);
        this.tempValue = newVal;

        if (newVal.match(/^.+\.(eth|etc)$/)) {
          this.updateENS();
        } else {
          this.$emit('input', newVal);
        }
      },
    },
    props() {
      return Object.keys(this.$props).reduce(
        (res, prop) => ({
          ...res,
          [kebabCase(prop)]: this.$props[prop],
        }),
        {},
      );
    },
  },
  methods: {
    async updateENS() {
      if (!this.innerValue.match(/^.+\.(eth|etc)$/)) return;

      const { name } = this;
      const field = this.$validator.fields.find({ name });

      if (!field) return;

      this.pendingEns = true;

      await this.$nextTick();

      this.$validator.flag(name, {
        invalid: true,
        valid: false,
        pending: true,
      });

      try {
        const address = await ENSResolver.getAddress(this.innerValue);

        this.$validator.flag(name, {
          valid: true,
          invalid: false,
          pending: false,
        });
        this.$emit('input', address);
      } catch (e) {
        this.$validator.errors.add({
          id: field.id,
          field: name,
          msg: e.message,
          scope: this.$options.scope,
        });
      } finally {
        this.pendingEns = false;
      }
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
