<template>
  <div class="advanced-options-container">
    <div class="field advanced-toggle is-horizontal">
      <div class="field-label" />
      <div class="field-body">
        <a
          class="has-text-link"
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
            :disabled="isLoading"
            name="gasPrice"
            type="number"
            min="1"
            max="100"
            step="1"
            validator="required|numeric|integer|between:1,100"
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
            :disabled="isLoading"
            name="gasLimit"
            type="number"
            min="21000"
            max="1000000"
            step="1000"
            validator="required|numeric|integer|between:21000,4000000"
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
            v-model="form.userNonce"
            :validator="`required|numeric|integer|min_value:${nextNonceInBlock}`"
            :disabled="isLoading"
            name="nonce"
            type="number"
            step="1"
            aria-describedby="nonce"
            placeholder="Nonce"
            required
            data-test="transaction-nonce-input"
          />
        </div>
      </div>

      <div class="field is-horizontal">
        <div class="field-label">
          <label class="label">Data</label>
        </div>
        <div class="field-body">
          <v-input
            v-show="!form.tokenInfo"
            id="data"
            v-model="form.data"
            :disabled="isLoading"
            name="data"
            validator="required|hex"
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
import { mapActions } from 'vuex';
import VInput from '@/components/ui/form/VInput.vue';
import VSpinner from '@/components/ui/VSpinner';

export default {
  name: 'AdvancedTransactionOptions',

  props: {
    transaction: {
      type: Object,
      required: true,
    },
  },

  data: () => ({
    form: {
      tokenInfo: null,
      data: '0x',
      nonce: 0,
      gasPrice: 0,
      gasLimit: 0,
      userNonce: null,
    },

    nonceInterval: null,
    nextNonceInBlock: 0,
    isLoading: false,
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
    transaction() {
      console.log('transaction update', this.transaction);
    },

    form() {
      this.emitChange();
    },
  },

  methods: {
    ...mapActions('transactions', ['getNextNonce', 'getNonceInBlock']),

    toggle() {
      this.isCollapsed = !this.isCollapsed;
    },

    emitChange() {
      this.$emit('change', this.form);
    },
  },

  created() {
    this.nonceInterval = setInterval(async () => {
      this.nextNonceInBlock = await this.getNonceInBlock();
      this.$validator.validate('nonce');
    }, 2000);
  },

  components: {
    VInput,
    VSpinner,
  },
};
</script>

<style lang="scss">
.advanced-options-container {
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
