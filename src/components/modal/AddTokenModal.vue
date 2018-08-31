<template lang="html">
  <v-modal @close="close">
    <template slot="header">Add custom token</template>

    <v-form
      v-if="!addedToken"
      id="addToken"
      v-model="isFormValid"
      @submit="createToken"
    >
      <v-input
        v-validate="'required|address'"
        id="address"
        v-model="token.address"
        :disabled="loadingToken"
        label="Address"
        name="address"
        aria-describedby="address"
        placeholder="Contract address"
        required
      />
      <v-input
        v-validate="'required|numeric|integer|between:0,18'"
        v-if="notFound.decimals"
        id="decimals"
        v-model.number="token.decimals"
        :disabled="!notFound.decimals"
        label="Decimals"
        name="decimals"
        aria-describedby="decimal"
        placeholder="Token decimals"
        required
      />
      <v-input
        v-validate="'required'"
        v-if="notFound.name"
        id="name"
        v-model="token.name"
        :disabled="!notFound.name"
        label="Name"
        name="name"
        aria-describedby="name"
        placeholder="Token name"
        required
      />
      <v-input
        v-validate="'required'"
        v-if="notFound.symbol"
        id="symbol"
        v-model="token.symbol"
        :disabled="!notFound.symbol"
        label="Symbol"
        name="symbol"
        aria-describedby="symbol"
        placeholder="Token symbol"
        required
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
          @click.prevent="createToken"
        >
          Find
        </v-button>
        <v-button
          v-else-if="loadedToken && !addedToken"
          :disabled="!isFormValid"
          class-name="is-primary"
          type="button"
          @click.prevent="addToken(token)"
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
          @click="close"
        >
          Close
        </a>
      </div>
    </div>

  </v-modal>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import erc20ABI from '@/abi/erc20.json';
import VModal from '@/components/ui/VModal';
import VForm from '@/components/ui/form/VForm';
import VInput from '@/components/ui/form/VInput';
import VButton from '@/components/ui/form/VButton';
import web3 from '@/utils/web3';

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
      isFormValid: false,
    };
  },
  computed: {
    ...mapState({
      address: state => state.accounts.address.getChecksumAddressString(),
    }),
  },
  methods: {
    ...mapActions('tokens', ['addTokenToSubscription']),
    resetForm() {
      Object.assign(this.$data, this.$options.data());
    },
    addToken() {
      this.addTokenToSubscription({ ...this.token });
      this.loadingToken = false;
      this.addedToken = true;
    },
    async createToken() {
      this.loadingToken = true;

      try {
        const contract = new web3.eth.Contract(erc20ABI, this.token.address);
        await this.checkContractExistence(contract);
        await this.setTokenData(contract);
        const { decimals, name, symbol } = this.token;

        if (decimals && symbol && name) {
          this.token.decimals = parseInt(decimals, 10);
          this.addToken(this.token);
        } else {
          this.loadingToken = false;
          this.loadedToken = true;
        }
      } catch (e) {
        this.loadingToken = false;
        this.$notify({
          title: 'Not a valid erc20 token',
          text: 'Please ensure token matches standard, and check address.',
          type: 'is-warning',
        });
      }
    },
    checkContractExistence(contract) {
      return contract.methods.balanceOf(this.address).call();
    },
    setTokenData(contract) {
      const tokenData = ['name', 'decimals', 'symbol'].map(async item => {
        try {
          this.token[item] = await contract.methods[item]().call();
        } catch (e) {
          this.notFound[item] = true;
        }
      });

      return Promise.all(tokenData);
    },
    close() {
      this.$emit('close');
    },
  },
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
