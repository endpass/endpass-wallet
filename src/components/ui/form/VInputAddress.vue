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
               v-validate="'required|ensOrAddress'"
               :data-vv-as="label || name"
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
import  web3 from 'web3';
export default {
  data() {
    const ens = new ENSResolver(this.$store.state.web3.web3);
    return {
      validatingEns: false,
      getNameTimeout: null,
      value: '',
      pendingEns: false,
      ens
    }
  },
  name: 'v-input',
  props: {
    id: {
      type: String,
      default: null,
    },
    required: {
      type: Boolean,
      default: true,
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
    }
  },
  inject: {
    $validator: '$validator',
  },
  methods: {
    camelToKebab: str => str.replace(/([A-Z])/g, g => `-${g[0].toLowerCase()}`),
    clearFiledTimeout() {
      if(this.getNameTimeout) {
        clearTimeout(this.getNameTimeout)
      }
    },
    async updateENS() {
      if(this.innerValue.match(/^.+\.eth$/) || this.innerValue.match(/^.+\.etc$/)) {
        const field = this.$validator.fields.find({ name: this.name, });
        if (!field) return;
        this.pendingEns = true;
        this.$validator.errors.remove(this.name);
        this.$validator.flag(this.name,{
          invalid: true,
          valid: false,
          pending: true
        });
        try{
          const address = await this.ens.getAddress(this.innerValue);
          this.$validator.flag(this.name,{
            valid: true,
            invalid: false,
            pending:false
          });
          this.$emit('input', address);
        } catch (e) {
          this.$validator.errors.remove(this.name);
          this.$validator.errors.add({
            id: field.id,
            field: this.name,
            msg: e.message,
            scope: this.$options.scope,
          });
          throw e
        } finally {
          this.pendingEns = false;
        }
      }
    }
  },
  computed: {
    innerValue: {
      get() {
        return this.value;
      },
      set(newVal) {
        const field = this.$validator.fields.find({ name: this.name, });
        if (!field) return;
        const zeroAddressRegex = /^0x0+$/;
        const isHashKey = web3.utils.isAddress(newVal);
        const isZeroKey = newVal.match(zeroAddressRegex);
        const message = isZeroKey
          ? 'This is a zero address'
          : 'This is not a valid address';
        if(newVal.match(/^.+\.eth$/) || newVal.match(/^.+\.etc$/)) {
          this.value = newVal;
          this.$validator.flag(this.name,{
            valid: true,
            invalid: false,
            pending:false
          });
          this.$validator.errors.remove(this.name);
        } else if(isHashKey && !isZeroKey) {
          this.$validator.flag(this.name,{
            valid: true,
            invalid: false,
            pending:false
          });
          this.$validator.errors.remove(this.name);
          this.value = newVal;
          this.$emit('input', newVal);
        } else {
          this.value = newVal;
          this.$validator.errors.remove(this.name);
          this.$validator.flag(this.name,{
            invalid: true,
            valid: false,
            pending: true
          });
          this.$validator.errors.add({
            id: field.id,
            field: this.name,
            msg: message,
            scope: this.$options.scope,
          });
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
  }
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
