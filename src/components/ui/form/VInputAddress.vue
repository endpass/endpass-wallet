<template>
  <div class="field">
    <label class="label"
           v-if="label"
           :for="id">{{ label }}</label>
    <div class="field"
         :class="{'has-addons': $slots.addon }">
      <div class="control"
           :class="{'is-expanded': $slots.addon,
           'is-loading': pendingEns }">
        <input v-model="innerValue"
               :name="name"
               v-validate="'required|ensOrAddress'"
               :data-vv-as="label || 'To' || name"
               data-vv-validate-on="input"
               class="input"
               :class="{'is-danger': error || errors.has(name)}"
               :disabled="disabled || pendingEns"
               v-bind="props">
      </div>
      <div class="control"
           v-if="$slots.addon">
        <slot name="addon" />
      </div>
    </div>
    <p class="help is-danger"
       v-if="error || errors.has(name) ">{{ error || errors.first(name) }}</p>
    <p class="help is-info"
        v-if="pendingEns">Resolving name</p>
  </div>
</template>

<script>
import { ENSResolver } from '@/class';
import { mapState } from 'vuex';
import web3 from '@/utils/web3';

export default {
  data() {
    return {
      pendingEns: false,
      tempValue: '',
    };
  },
  name: 'v-input-address',
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
  inject: {
    $validator: '$validator',
  },
  methods: {
    camelToKebab: str => str.replace(/([A-Z])/g, g => `-${g[0].toLowerCase()}`),
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
        const address = await this.$ens.getAddress(this.innerValue);
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
          [this.camelToKebab(prop)]: this.$props[prop],
        }),
        {},
      );
    },
  },
  created() {
    this.$ens = new ENSResolver(web3);
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
