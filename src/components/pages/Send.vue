<template>
  <div class="app-page send-page">
    <div class="section">
      <div class="container is-narrow">
        <div class="card app-card main-app-card">
          <div class="card-header">
            <h1 class="card-header-title">Send ETH</h1>
          </div>
          <div class="card-content">
            <v-form id="sendEther">

              <v-input v-model="transaction.to"
                       label="To"
                       name="address"
                       v-validate="'required|address'"
                       id="address"
                       aria-describedby="address"
                       placeholder="Receiver address"
                       :disabled="isSending"
                       required />

              <div class="columns">
                <div class="column is-half is-full-mobile">
                  <v-input v-model="value"
                          label="Amount"
                          type="number"
                          name="value"
                          v-validate="`required|decimal:${decimal}|between:0,${maxAmount}`"
                          data-vv-as="amount"
                          id="value"
                          aria-describedby="value"
                          placeholder="Amount"
                          :disabled="isSending"
                          required>
                    <span class="select" slot="addon">
                      <select v-model="transaction.tokenInfo">
                        <option :value="undefined">ETH</option>
                        <option
                          :value="token"
                          v-for="token in tokens"
                          :key="token.address">{{token.symbol}}</option>
                      </select>
                    </span>
                  </v-input>
                </div>
                <div class="column is-half is-full-mobile">
                  <v-input v-model="price"
                          label="Price"
                          type="number"
                          name="price"
                          v-validate="`required|decimal:2|max_value:${maxPrice}`"
                          id="price"
                          aria-describedby="price"
                          placeholder="Price"
                          :disabled="isSending"
                          required>
                    <div class="control" slot="addon">
                      <a class="button is-static">{{fiatCurrency}}</a>
                    </div>
                  </v-input>
                </div>
              </div>

              <v-input v-model="transaction.gasPrice"
                       label="Gas price"
                       name="gasPrice"
                       type="number"
                       v-validate="'required|numeric|integer|between:0,100'"
                       id="gasPrice"
                       aria-describedby="gasPrice"
                       placeholder="Gas price"
                       :disabled="isSending"
                       required>
                <div class="control" slot="addon">
                  <a class="button is-static">Gwei</a>
                </div>
              </v-input>

              <v-input v-model="transaction.gasLimit"
                       label="Gas limit"
                       name="gasLimit"
                       type="number"
                       v-validate="'required|numeric|integer|between:21000,4000000'"
                       id="gasLimit"
                       aria-describedby="gasLimit"
                       placeholder="Gas limit"
                       :disabled="isSending"
                       required />

              <v-input v-show="selectedToken === 'ETH'"
                       v-model="transaction.data"
                       label="Data"
                       name="data"
                       v-validate="'required|hex'"
                       id="data"
                       aria-describedby="data"
                       placeholder="Data"
                       :disabled="isSending"
                       required />

              <v-button @click.prevent="toggleModal"
                        className="is-primary is-medium"
                        :loading="isSending"
                        :disabled="isSyncing">Send</v-button>

              <div v-if="transactionHash">{{ transactionHash }}</div>
            </v-form>
          </div>
        </div>
      </div>
    </div>
    <transaction-modal v-if="isModal"
                       :transaction="transaction"
                       :token="selectedToken"
                       @confirm="confirmTransaction"
                       @close="toggleModal" />
  </div>
</template>

<script>
import web3 from 'web3';
import Tx from 'ethereumjs-tx';
import { BigNumber } from 'bignumber.js'
import { Transaction } from '@/class'
import { mapState, mapMutations } from 'vuex';
import VForm from '@/components/ui/form/VForm.vue';
import VInput from '@/components/ui/form/VInput.vue';
import VButton from '@/components/ui/form/VButton.vue';
import TransactionModal from '@/components/modal/TransactionModal';

const defaultTnx = {
  gasPrice: '90',
  gasLimit: '22000',
  value: '0',
  tokenInfo: undefined,
  to: '',
  data: '0x'
}

export default {
  data: () => ({
    selectedToken: 'ETH',
    toCache: '',
    isSending: false,
    transactionHash: null,
    transaction: new Transaction(defaultTnx),
    estimateGasCost: 0,
    priceInFiat: '0.00',
    lastInputPrice: 'amount',
    isModal: false,
  }),
  computed: {
    ...mapState({
      pendingTransactions: state => state.accounts.pendingTransactions,
      balance: state => state.accounts.balance,
      address: state => state.accounts.activeAccount.getAddressString(),
      account: state => state.accounts.activeAccount,
      tokens: state => state.tokens.activeTokens,
      web3: state => state.web3.web3,
      isSyncing: state => !!state.web3.isSyncing,
      fiatCurrency: state => state.accounts.settings.fiatCurrency,
      ethPrice: state => state.price.price,
    }),
    value: {
      get() {
        const { value } = this.transaction;

        if (this.lastInputPrice === 'fiat' && value > 0) {
          const { price, ethPrice, decimal } = this;
          return BigNumber(price).div(ethPrice).toFixed(decimal);
        }

        return value;
      },
      set(newValue) {
        this.transaction.value = newValue;
        this.lastInputPrice = 'amount';
        this.priceInFiat = BigNumber(newValue || '0')
          .times(this.ethPrice)
          .toFixed(2);

        this.$nextTick(() => this.$validator.validate('price'));
      },
    },
    price: {
      get() {
        if (this.lastInputPrice === 'amount' && this.priceInFiat > 0) {
          const { value, ethPrice } = this;
          return BigNumber(value).times(ethPrice).toFixed(2);
        }

        return this.priceInFiat;
      },
      set(newValue) {
        this.priceInFiat = newValue;
        this.lastInputPrice = 'fiat';
        this.transaction.value = BigNumber(newValue || '0')
          .div(this.ethPrice)
          .toFixed(newValue > 0 ? this.decimal : 0);

        this.$nextTick(() => this.$validator.validate('value'));
      },
    },
    maxAmount() {
      if (this.transaction.tokenInfo) {
        return this.transaction.tokenInfo.balance || '0';
      }

      const { fromWei } = web3.utils;
      const balanceBN = BigNumber(this.balance || '0');
      const estimateGasCostBN = BigNumber(this.estimateGasCost || '0');
      const amountBN = balanceBN.minus(estimateGasCostBN);
      const amount = fromWei(amountBN.toFixed());

      return amount > 0 ? amount : 0;
    },
    maxPrice() {
      const balance = new BigNumber(this.maxAmount);
      const amount = balance.times(this.ethPrice).minus('0.01').toFixed(2);
      return amount > 0 ? amount : 0;
    },
    decimal() {
      const { tokenInfo } = this.transaction;
      return tokenInfo && tokenInfo.decimals || 18;
    }
  },
  methods: {
    ...mapMutations('accounts', ['addTransaction', 'updateTransaction']),
    sendTransaction() {
      this.isSending = true;
      this.transaction.from = this.address
      this.web3.eth.getTransactionCount(this.address).then(nonce => {
        const pendingLength = this.pendingTransactions.filter(
          tnx => tnx.state === 'pending'
        ).length;
        this.transaction.nonce = (nonce + pendingLength).toString();
        const tx = new Tx(this.transaction.getApiObject(this.web3.eth));
        tx.sign(this.account.getPrivateKey());
        const serializedTx = tx.serialize();
        this.addTransaction(this.transaction);

        const sendEvent = this.web3.eth
          .sendSignedTransaction('0x' + serializedTx.toString('hex'))
          .on('confirmation', (confNumber, { transactionHash }) => {
            if (confNumber > 0) {
              sendEvent.off('confirmation');
              this.updateTransaction({
                hash: transactionHash,
                state: 'success',
              })
            }
          })
          .on('error', (err, receipt) => {
            sendEvent.off('error');
            this.isSending = false;
            this.transaction = new Transaction(defaultTnx);
            this.$validator.flag('address', {
              valid: false,
            });

            const cause = receipt ? ', because out of gas' : '';

            this.$notify({
              title: 'Error sending transaction',
              text: `Transaction was not sent${cause}`,
              type: 'is-danger',
            });

            console.error(err)
          })
          .on('transactionHash', hash => {
            sendEvent.off('transactionHash');
            this.isSending = false;
            this.transaction.state = 'pending';
            this.transactionHash = hash;
            this.transaction.hash = hash;
            this.transaction = new Transaction(defaultTnx);
            this.$validator.flag('address', {
              valid: false,
            });

            this.$notify({
              title: 'Successful',
              text: 'Transaction was sent',
              type: 'is-info',
            })
          });
      })
    },
    toggleModal() {
      this.isModal = !this.isModal;
    },
    confirmTransaction() {
      this.toggleModal();
      this.sendTransaction();
    },
    async updateEstimateGasCost() {
      this.estimateGasCost = await this.transaction.getFullPrice(this.web3.eth);
    }
  },
  watch: {
    'transaction.to': {
      async handler() {
        await this.$nextTick();
        await this.$nextTick();

        if (!this.errors.has('address')) {
          this.updateEstimateGasCost();
        }
      },
      immediate: true,
    },
    'transaction.data': {
      async handler() {
        await this.$nextTick();
        await this.$nextTick();

        if (!this.errors.has('data')) {
          this.updateEstimateGasCost();
        }
      },
    },
    selectedToken() {
      this.updateEstimateGasCost();
    },
  },
  components: {
    VForm,
    VButton,
    VInput,
    TransactionModal,
  },
};
</script>

<style lang="scss">
</style>
