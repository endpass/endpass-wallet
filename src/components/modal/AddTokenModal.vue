<template lang="html">
  <v-modal
    data-test="add-token-modal"
    @close="close"
  >
    <template slot="header">Add custom token</template>

    <v-form
      v-if="!addedToken"
      id="addToken"
      v-model="isFormValid"
      @submit="addToken"
      :isFormValid="isFormValid"
    >
      <v-input
        v-validate="'required|address'"
        id="address"
        name="address"
        data-vv-name="address"
        v-model="token.address"
        :disabled="loadingToken"
        label="Address"
        :error="errors.first('address')"
        aria-describedby="address"
        placeholder="Contract address"
        data-test="address-input"
        required
        autofocus
      />
      <v-input
        v-validate="'required|numeric|integer|between:0,18'"
        v-if="notFound.decimals"
        id="decimals"
        v-model.number="token.decimals"
        :disabled="!notFound.decimals"
        label="Decimals"
        name="decimals"
        data-vv-name="decimals"
        :error="errors.first('decimals')"
        aria-describedby="decimal"
        placeholder="Token decimals"
        required
        data-test="token-decimals-input"
      />
      <v-input
        v-validate="'required'"
        v-if="notFound.name"
        id="name"
        v-model="token.name"
        :disabled="!notFound.name"
        label="Name"
        name="name"
        data-vv-name="name"
        :error="errors.first('name')"
        aria-describedby="name"
        placeholder="Token name"
        required
        data-test="token-name-input"
      />
      <v-input
        v-validate="'required'"
        v-if="notFound.symbol"
        id="symbol"
        v-model="token.symbol"
        :disabled="!notFound.symbol"
        label="Symbol"
        name="symbol"
        data-vv-name="symbol"
        :error="errors.first('symbol')"
        aria-describedby="symbol"
        placeholder="Token symbol"
        required
        data-test="token-symbol-input"
      />
    </v-form>
    <div v-else>
      <p class="subtitle">New token added</p>
      <div class="message">
        <div class="message-header">
          <p>{{ token.name }} ({{ token.symbol }})</p>
        </div>
        <div class="message-body">
          <p class="code address">{{ token.address }}</p>
        </div>
      </div>
    </div>

    <div slot="footer">
      <div class="buttons">
        <v-button
          v-if="!loadedToken && !addedToken"
          :loading="loadingToken"
          :disabled="!isFormValid"
          class-name="is-primary"
          type="button"
          data-test="find-button"
          @click.prevent="addToken"
        >
          Find
        </v-button>
        <v-button
          v-else-if="loadedToken && !addedToken"
          :disabled="!isFormValid"
          class-name="is-primary"
          type="button"
          data-test="add-button"
          @click.prevent="addToken"
        >
          Add
        </v-button>
        <v-button
          v-else-if="addedToken"
          :disabled="!isFormValid"
          class-name="is-primary"
          type="button"
          @click.prevent="resetForm"
        >
          Add more
        </v-button>
      </div>
      <div class="is-pulled-right">
        <a
          :disabled="loadingToken"
          class="button"
          data-test="close-button"
          @click="close"
        >
          Close
        </a>
      </div>
    </div>

  </v-modal>
</template>

<script>
import { mapActions } from 'vuex';
import { ERC20Token } from '@/class';
import VModal from '@/components/ui/VModal';
import VForm from '@/components/ui/form/VForm';
import VInput from '@/components/ui/form/VInput';
import VButton from '@/components/ui/form/VButton';
import formMixin from '@/mixins/form';

export default {
  name: 'AddTokenModal',

  data() {
    return {
      loadingToken: false,
      loadedToken: false,
      addedToken: false,
      token: {
        address: '',
        symbol: '',
        name: '',
        decimals: '',
      },
      notFound: {
        decimals: false,
        name: false,
        symbol: false,
      },
    };
  },
  computed: {
    isValidToken() {
      const { decimals, name, symbol } = this.token;
      return !!(decimals && symbol && name);
    },
  },
  methods: {
    ...mapActions('tokens', ['addUserToken']),

    resetForm() {
      Object.assign(this.$data, this.$options.data());
    },

    async addToken() {
      this.loadingToken = true;

      try {
        const { address } = this.token;

        if (!this.isValidToken) {
          await this.setTokenData(address);

          if (!this.isValidToken) {
            this.loadedToken = true;
            return;
          }
        }

        this.token.decimals = parseInt(this.token.decimals, 10);
        await this.addUserToken({ token: { ...this.token } });

        this.loadingToken = false;
        this.addedToken = true;
      } catch (e) {
        this.loadingToken = false;
        this.$notify({
          title: 'Not a valid erc20 token',
          text: 'Please ensure token matches standard, and check address.',
          type: 'is-warning',
        });
      }
    },

    async setTokenData(tokenAddress) {
      const erc20 = new ERC20Token(tokenAddress);
      const tokenInfo = await erc20.getToken();

      this.token = {
        ...this.token,
        name: tokenInfo.name,
        decimals: tokenInfo.decimals,
        symbol: tokenInfo.symbol,
      };

      Object.keys(this.notFound).forEach(item => {
        if (!this.token[item]) {
          this.notFound[item] = true;
        }
      });
    },

    close() {
      this.$emit('close');
    },
  },
  mixins: [formMixin],
  components: {
    VModal,
    VForm,
    VInput,
    VButton,
  },
};
</script>

<style lang="scss">
</style>
