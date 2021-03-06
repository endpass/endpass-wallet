<template lang="html">
  <v-modal
    data-test="add-token-modal"
    @close="close"
  >
    <template slot="header">
      {{ $t('components.addTokenModal.header') }}
    </template>

    <v-form
      v-if="!addedToken"
      id="addToken"
      v-model="isFormValid"
      :is-form-valid="isFormValid"
      @submit="addToken"
    >
      <v-input
        id="address"
        v-model="token.address"
        v-validate="'required|address'"
        :disabled="loadingToken"
        :error="errors.first('address')"
        name="address"
        data-vv-name="address"
        :label="$t('components.addTokenModal.contractAddress')"
        aria-describedby="address"
        :placeholder="$t('components.addTokenModal.contractAddress')"
        data-test="address-input"
        required
        autofocus
      />
      <v-input
        v-if="notFound.decimals"
        id="decimals"
        v-model.number="token.decimals"
        v-validate="'required|numeric|integer|between:0,18'"
        :disabled="!notFound.decimals"
        :error="errors.first('decimals')"
        :label="$t('components.addTokenModal.tokenDecimals')"
        name="decimals"
        :data-vv-name="$t('components.addTokenModal.tokenDecimals')"
        aria-describedby="decimal"
        :placeholder="$t('components.addTokenModal.tokenDecimals')"
        required
        data-test="token-decimals-input"
      />
      <v-input
        v-if="notFound.name"
        id="name"
        v-model="token.name"
        v-validate="'required'"
        :disabled="!notFound.name"
        :error="errors.first('name')"
        label="$t('components.addTokenModal.tokenName')"
        name="name"
        data-vv-name="name"
        aria-describedby="name"
        placeholder="$t('components.addTokenModal.tokenName')"
        required
        data-test="token-name-input"
      />
      <v-input
        v-if="notFound.symbol"
        id="symbol"
        v-model="token.symbol"
        v-validate="'required'"
        :disabled="!notFound.symbol"
        :error="errors.first('symbol')"
        :label="$t('components.addTokenModal.tokenSymbol')"
        name="symbol"
        data-vv-name="symbol"
        aria-describedby="symbol"
        :placeholder="$t('components.addTokenModal.tokenSymbol')"
        required
        data-test="token-symbol-input"
      />
    </v-form>
    <div v-else>
      <p class="subtitle">
        {{ $t('components.addTokenModal.newTokenAdded') }}
      </p>
      <div class="message">
        <div class="message-header">
          <p>{{ token.name }} ({{ token.symbol }})</p>
        </div>
        <div class="message-body">
          <p class="code address">
            {{ token.address }}
          </p>
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
          {{ $t('global.find') }}
        </v-button>
        <v-button
          v-else-if="loadedToken && !addedToken"
          :disabled="!isFormValid"
          class-name="is-primary"
          type="button"
          data-test="add-button"
          @click.prevent="addToken"
        >
          {{ $t('global.add') }}
        </v-button>
        <v-button
          v-else-if="addedToken"
          :disabled="!isFormValid"
          class-name="is-primary"
          type="button"
          @click.prevent="resetForm"
        >
          {{ $t('global.addMore') }}
        </v-button>
      </div>
      <div class="is-pulled-right">
        <a
          :disabled="loadingToken"
          class="button"
          data-test="close-button"
          @click="close"
        >
          {{ $t('global.close') }}
        </a>
      </div>
    </div>
  </v-modal>
</template>

<script>
import { mapActions } from 'vuex';
import { ERC20Token } from '@/class';
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
          title: this.$t('components.addTokenModal.tokenNotValid'),
          text: this.$t('components.addTokenModal.checkAddress'),
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
};
</script>

<style lang="scss"></style>
