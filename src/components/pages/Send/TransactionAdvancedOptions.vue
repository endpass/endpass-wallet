<template>
  <div class="advanced-options-container">
    <div class="field advanced-toggle is-horizontal">
      <div class="field-label" />
      <div class="field-body">
        <a
          class="has-text-link"
          role="button"
          data-test="transaction-advanced-options-button"
          @click="toggle"
        >
          {{ togglerText }}
        </a>
      </div>
    </div>

    <div
      v-show="!isCollapsed"
      class="advanced-options"
      data-test="transaction-advanced-options"
    >
      <div class="field is-horizontal">
        <div class="field-label">
          <label class="label">Gas Price</label>
        </div>
        <div class="field-body">
          <v-input
            id="gasPrice"
            v-model="form.gasPrice"
            v-validate="'required|numeric|integer|between:1,100'"
            :disabled="isLoading"
            :error="errors.first('gasPrice')"
            name="gasPrice"
            data-vv-name="gasPrice"
            type="number"
            min="1"
            max="100"
            step="1"
            aria-describedby="gasPrice"
            placeholder="Gas price"
            data-test="transaction-gas-price-input"
            required
          >
            <div
              slot="addon"
              class="control"
            >
              <a class="button is-static">Gwei</a>
            </div>
          </v-input>
        </div>
      </div>

      <div class="field is-horizontal">
        <div class="field-label">
          <label class="label">Gas Limit</label>
        </div>
        <div class="field-body">
          <v-input
            id="gasLimit"
            v-model="form.gasLimit"
            v-validate="'required|numeric|integer|between:21000,1000000'"
            :disabled="isLoading"
            :error="errors.first('gasLimit')"
            data-vv-name="gasLimit"
            name="gasLimit"
            type="number"
            min="21000"
            max="1000000"
            step="1000"
            aria-describedby="gasLimit"
            placeholder="Gas limit"
            data-test="transaction-gas-limit-input"
            required
          />
        </div>
      </div>

      <div class="field is-horizontal">
        <div class="field-label">
          <label class="label">Nonce</label>
        </div>
        <div class="field-body">
          <v-input
            id="nonce"
            v-model="form.nonce"
            v-validate="
              `required|numeric|integer|min_value:${nextNonceInBlock}`
            "
            :error="errors.first('nonce')"
            :disabled="isLoading"
            name="nonce"
            data-vv-name="nonce"
            type="number"
            step="1"
            aria-describedby="nonce"
            placeholder="Nonce"
            required
            data-test="transaction-nonce-input"
          />
        </div>
      </div>

      <div
        v-show="!currentToken"
        class="field is-horizontal"
      >
        <div class="field-label">
          <label class="label">Data</label>
        </div>
        <div class="field-body">
          <v-input
            id="data"
            v-model="form.data"
            v-validate="'required|hex'"
            :disabled="isLoading"
            :error="errors.first('data')"
            name="data"
            data-vv-name="data"
            aria-describedby="data"
            placeholder="Data"
            required
            data-test="transaction-data-input"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { pick } from 'lodash';
import { mapActions } from 'vuex';

export default {
  name: 'AdvancedTransactionOptions',

  inject: ['$validator'],

  props: {
    transaction: {
      type: Object,
      required: true,
    },

    currentToken: {
      type: Object,
      default: null,
    },

    isLoading: {
      type: Boolean,
      default: false,
    },

    isOpened: {
      type: Boolean,
      default: false,
    },
  },

  data: () => ({
    form: {
      data: '0x',
      nonce: '0',
      gasPrice: 0,
      gasLimit: 0,
    },

    nonceInterval: null,
    nextNonceInBlock: 0,
    isCollapsed: true,
  }),

  computed: {
    togglerText() {
      if (this.isCollapsed) {
        return 'Show advanced options';
      }

      return 'Hide advanced options';
    },
  },

  watch: {
    isOpened: {
      handler() {
        if (this.isOpened && this.isCollapsed) {
          this.isCollapsed = false;
        }
      },
      immediate: true,
    },

    'transaction.gasPrice': {
      handler() {
        const { gasPrice } = this.transaction;

        this.form.gasPrice = gasPrice;
      },
    },

    'transaction.nonce': {
      handler() {
        const { nonce } = this.transaction;

        this.form.nonce = nonce;
        this.$validator.validate('nonce');
      },
    },

    form: {
      handler() {
        this.emitChange();
      },
      deep: true,
    },

    nextNonceInBlock() {
      const { form, nextNonceInBlock } = this;

      if (form.nonce < nextNonceInBlock) {
        this.form.nonce = nextNonceInBlock;
      }
    },
  },

  methods: {
    ...mapActions('transactions', ['getNonceInBlock']),

    toggle() {
      this.isCollapsed = !this.isCollapsed;
    },

    emitChange() {
      this.$emit('change', this.form);
    },
  },

  async created() {
    Object.assign(
      this.form,
      pick(this.transaction, ['gasPrice', 'gasLimit', 'nonce']),
    );

    this.nonceInterval = setInterval(async () => {
      this.nextNonceInBlock = await this.getNonceInBlock();
    }, 2000);
  },

  beforeDestroy() {
    clearInterval(this.nonceInterval);
    this.nonceInterval = null;
  },
};
</script>

<style lang="scss">
.advanced-options-container {
  margin-bottom: 0.75rem;
}
.advanced-options {
  overflow: hidden;
  height: auto;
  max-height: 1000px;

  display: inherit !important; /* override v-show display: none */
  transition: max-height 0.3s ease-in-out;
}
.advanced-options[style*='display: none;'] {
  max-height: 0;
  pointer-events: none; /* disable user interaction */
  user-select: none; /* disable user selection */
}
</style>
