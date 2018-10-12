<template>
  <div class="section">
    <div class="container">
      <div class="card app-card">
        <div class="card-header dapp-form">
          <v-input
            v-model="url"
            :disabled="loading"
            name="url"
            placeholder="Enter dapp url..."
            class-name="dapp-form-input"
            data-vv-as="Dapp url"
            validator="required"
            @input="onChangeUrlInput"
            @blur="onBlurUrlInput"
          />
          <!-- |url:require_protocol:true:require_tld:false -->
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
    <!-- <password-modal
      @confirm="confirmSign"
      @close="cancelSign"
    /> -->
  </div>
</template>

<script>
import { isEmpty, get } from 'lodash';
import { mapActions } from 'vuex';
import VInput from '@/components/ui/form/VInput';
import PasswordModal from '@/components/modal/PasswordModal';
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
    currentTransactionToSign() {
      return this.$store.state.dapp.currentTransactionToSign[0];
    },

    dappUrl() {
      return `/proxy/${this.url}`;
    },
  },

  methods: {
    ...mapActions('dapp', [
      'attach',
      'detach',
      'sendResponse',
      'cancelTransaction',
    ]),

    async loadDapp() {
      if (!isEmpty(this.$validator.errors.items)) return;

      this.loading = true;
    },

    onDappLoad() {
      const { dapp } = this.$refs;

      try {
        get(dapp.contentWindow, 'location.href');

        dapp.contentWindow.endpassDappBridge = window.endpassDappBridge;

        this.loaded = true;
      } catch (err) {
        console.log(err);
        this.error = err;
        this.loaded = false;
      } finally {
        this.loading = false;
      }
    },

    onBlurUrlInput() {
      if (this.error) {
        this.error = null;
      }

      this.loadDapp();
    },

    onChangeUrlInput() {
      if (this.loaded) {
        this.loaded = false;
      }
    },

    confirmSign() {
      // TODO sign transaction and send response
      console.log('sign', this.currentTransactionToSign);
    },

    cancelSign() {
      // TODO cancel transaction and send response
      console.log('cancel', this.currentTransactionToSign);
      // this.cancelTransaction(this.currentTransactionToSign);
    },
  },

  created() {
    this.attach();
  },

  beforeDestroy() {
    this.detach();
  },

  mixins: [privatePage],

  components: {
    VInput,
    PasswordModal,
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
