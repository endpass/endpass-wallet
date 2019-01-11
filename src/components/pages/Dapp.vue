<template>
  <div class="section">
    <div class="container">
      <div class="card app-card">
        <div class="card-header dapp-form">
          <v-input
            v-model="url"
            :disabled="loading"
            name="url"
            data-vv-name="url"
            placeholder="Enter dapp url..."
            class-name="dapp-form-input"
            data-vv-as="Dapp url"
            v-validate="'required|url:require_protocol:true:require_tld:false'"
            :error="errors.first('url')"
            data-test="dapp-url-input"
            @keydown.enter="openDapp"
            @input="onChangeUrlInput"
          >
            <div
              slot="addon"
              class="control"
            >
              <button
                :disabled="loading || loaded || !isUrlCorrect"
                class="button is-primary"
                data-test="dapp-open-button"
                @click="openDapp"
              >
                Open
              </button>
            </div>
          </v-input>
        </div>
        <iframe
          v-if="loading || loaded"
          v-show="loaded"
          ref="dapp"
          :src="dappUrl"
          class="dapp-frame"
          @load="onDappLoad"
        />
        <p
          v-if="error"
          class="dapp-error help is-danger"
        >
          Page is not loaded. Try load other page or reload current.
        </p>
      </div>
    </div>
    <password-modal
      v-if="currentRequest"
      title="Opened dapp requests your password"
      @confirm="confirmSign"
      @close="cancelSign"
    >
      <transaction-table
        v-if="isCurrentRequestTransaction"
        :currency="activeCurrency"
        :transaction="currentRequestTransactionData"
      />
    </password-modal>
  </div>
</template>

<script>
import { isEmpty, get } from 'lodash';
import { mapActions, mapState, mapGetters } from 'vuex';
import { TransactionFactory } from '@/class';
import PasswordModal from '@/components/modal/PasswordModal';
import TransactionTable from '@/components/TransactionTable';
import privatePage from '@/mixins/privatePage';

export default {
  name: 'Dapp',

  data: () => ({
    url: '',
    loading: false,
    loaded: false,
    error: null,
  }),

  computed: {
    ...mapState({
      injected: state => state.dapp.injected,
      activeCurrency: state => state.web3.activeCurrency,
    }),
    ...mapGetters('dapp', ['currentRequest']),

    dappUrl() {
      return `${ENV.wildproxyUrl}${this.url}`;
    },

    isCurrentRequestTransaction() {
      return get(this.currentRequest, 'method') === 'eth_sendTransaction';
    },

    isUrlCorrect() {
      return !isEmpty(this.url) && !this.$validator.errors.has('url');
    },

    currentRequestTransactionData() {
      return (
        this.isCurrentRequestTransaction &&
        TransactionFactory.fromRequestParams(this.currentRequest.params[0])
      );
    },
  },

  watch: {
    url() {
      this.onChangeUrlInput();
    },

    injected() {
      if (!this.injected) {
        this.loaded = false;
        this.loading = false;
      }
    },
  },

  methods: {
    ...mapActions('dapp', [
      'inject',
      'reset',
      'processCurrentRequest',
      'cancelCurrentRequest',
    ]),

    async loadDapp() {
      this.loading = true;

      await this.$nextTick();
      await this.inject(this.$refs.dapp.contentWindow);
    },

    onDappLoad() {
      const { dapp } = this.$refs;

      try {
        // If contentWindow property is not accessable it should throw error
        get(dapp.contentWindow, 'location');
        this.loaded = true;
      } catch (err) {
        this.error = err;
        this.loaded = false;
      } finally {
        this.loading = false;
      }
    },

    openDapp() {
      const { loaded, error, loadDapp, isUrlCorrect } = this;

      if (loaded || !isUrlCorrect) return;

      if (error) {
        this.error = null;
      }

      loadDapp();
    },

    onChangeUrlInput() {
      if (this.loaded) {
        this.loaded = false;
        this.reset();
      }
    },

    async confirmSign(password) {
      await this.processCurrentRequest(password);
    },

    async cancelSign() {
      await this.cancelCurrentRequest();
    },
  },

  beforeDestroy() {
    this.reset();
  },

  $_veeValidate: {
    validator: 'new',
  },

  mixins: [privatePage],

  components: {
    PasswordModal,
    TransactionTable,
  },
};
</script>

<style lang="scss">
.dapp-form {
  display: block;
  padding: 10px;
}

.dapp-form-input {
  width: 100%;
}

.dapp-frame {
  width: 100%;
  height: 600px;
}

.dapp-error {
  padding: 10px;
}
</style>
