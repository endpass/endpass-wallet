<template>
  <div class="account-chooser">
    <div class="field">
      <div class="control is-expanded">
        <vue-multiselect
          ref="select"
          :disabled="disabled"
          :options="accounts"
          :option-height="height"
          :searchable="searchable"
          :show-labels="false"
          :allow-empty="allowEmpty"
          :value="value"
          :placeholder="placeholder"
          :show-no-results="false"
          @search-change="handleSearchInput"
          @close="handleDropdownClose"
          @select="emitInput"
        >
          <span
            slot="singleLabel"
            slot-scope="props"
            class="multiselect-single"
          >
            <account
              :class="singleClass"
              :address="value"
              :size="width"
            />
          </span>
          <span
            slot="option"
            slot-scope="props"
            class="multiselect-option"
          >
            <account
              :class="optionClass"
              :address="props.option"
              :size="width"
            />
          </span>
        </vue-multiselect>
      </div>
      <p
        v-if="error"
        class="help is-danger"
      >
        {{ error }}
      </p>
    </div>
  </div>
</template>

<script>
import VueMultiselect from 'vue-multiselect';
import Account from '@/components/Account';
import addressValidator from '@/validation/address';

export default {
  name: 'AccountChooser',
  props: {
    // Maximum width of address
    width: {
      type: Number,
      default: 50,
    },

    height: {
      type: Number,
      default: 32,
    },

    // Classes to set on selected single account
    singleClass: {
      type: Object,
      default: () => {},
    },

    // Classes to set on non selected options
    optionClass: {
      type: Object,
      default: () => {},
    },

    accounts: {
      type: Array,
      default: () => [],
    },

    searchable: {
      type: Boolean,
      required: false,
      default: false,
    },

    placeholder: {
      type: String,
      required: false,
      default: 'Select account',
    },

    allowEmpty: {
      type: Boolean,
      required: false,
      default: true,
    },

    disabled: {
      type: Boolean,
      required: false,
      default: false,
    },

    value: {
      type: String,
      required: false,
      default: '',
    },

    creatable: {
      type: Boolean,
      required: false,
      default: false,
    },
  },

  data: () => ({
    searchInput: null,
    newAccountAddress: '',
    isAddressValid: true,
    error: null,
  }),

  created() {
    this.$nextTick(() => {
      const { $refs: $selectRefs } = this.$refs.select;

      if ($selectRefs.search && this.creatable) {
        this.searchInput = $selectRefs.search;
        this.searchInput.addEventListener('blur', this.handleSearchBlur);
        this.searchInput.addEventListener('focus', this.handleSearchFocus);
      }
    });
  },

  beforeDestroy() {
    if (this.searchInput) {
      this.searchInput.removeEventListener('blur', this.handleSearchBlur);
      this.searchInput.removeEventListener('focus', this.handleSearchFocus);
    }
  },

  methods: {
    handleSearchBlur() {
      const { valid, data } = addressValidator.validate(this.newAccountAddress);

      if (!valid) {
        this.error = data.message;
      }

      this.emitInput(this.newAccountAddress);
    },

    handleSearchFocus() {
      this.$refs.select.search = this.value
        ? this.value
        : this.newAccountAddress;
    },

    handleSearchInput(value) {
      if (this.creatable) {
        this.newAccountAddress = value;
      }
    },

    handleDropdownClose() {
      this.error = null;
    },

    emitInput(value) {
      this.$emit('input', value);
    },
  },
  components: {
    VueMultiselect,
    Account,
  },
  filters: {
    // Truncate an address to the first 4 and last 4 characters
    truncateAddr(value) {
      if (!value) return '';
      value = value.toString();
      return `${value.substr(0, 4)}...${value.substr(value.length - 4)}`;
    },
  },
};
</script>


<style lang="scss">
</style>
