<template>
  <div
    class="account-chooser"
    data-test="account-chooser"
  >
    <div class="field">
      <vue-multiselect
        ref="select"
        :disabled="disabled"
        :options="accounts"
        :option-height="height"
        :searchable="creatable"
        :show-labels="false"
        :allow-empty="allowEmpty"
        :value="value"
        :placeholder="placeholder"
        @search-change="handleSearchInput"
        @select="emitInput($event, true)"
      >
        <span slot="noResult">
          {{ noResultLabel }}
        </span>
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
  </div>
</template>

<script>
import VueMultiselect from 'vue-multiselect';
import Account from '@/components/Account';
import addressValidator from '@/validation/ensOrAddress';

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
    ignoreNextBlur: false,
  }),

  computed: {
    noResultLabel() {
      const { newAccountAddress, creatable } = this;

      if (!creatable) {
        return 'No elements found. Consider changing the search query.';
      }

      const { valid, data } = this.validateAddress(newAccountAddress);

      return valid ? 'Address is valid' : data.message;
    },
  },

  methods: {
    validateAddress(address) {
      return addressValidator.validate(address);
    },

    handleSearchBlur() {
      /**
       * This condition needs because after click vue-multiselect option search input blur also
       * calls and emmited value always empty
       */
      if (this.ignoreNextBlur) {
        this.ignoreNextBlur = false;
        return;
      }

      const { valid } = this.validateAddress(this.newAccountAddress);

      if (valid) {
        this.emitInput(this.newAccountAddress);
      }
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

    /**
     * Emits input event
     * Contains logic for detect origin vue-multiselect select event and programmicialy generated
     * @param {*} value Emmiting value
     * @param {Boolean} isSelect Flag for marking original event of vue-multiselect select handler
     */
    emitInput(value, isSelect = false) {
      this.ignoreNextBlur = isSelect;

      this.$emit('input', value);
    },
  },

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

  components: {
    VueMultiselect,
    Account,
  },
};
</script>


<style lang="scss">
.account-chooser .multiselect--active {
  z-index: 10;
}
</style>
