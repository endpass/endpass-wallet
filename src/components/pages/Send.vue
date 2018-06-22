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
              <v-input v-model="transaction.value"
                       label="Amount"
                       type="number"
                       name="value"
                       v-validate="`required|decimal:${transaction.tokenInfo && transaction.tokenInfo.decimals || 18}|between:0,${maxAmount}`"
                       data-vv-as="amount"
                       id="value"
                       aria-describedby="value"
                       placeholder="Amount"
                       :disabled="isSending"
                       required>
                <span class="select" slot="addon">
                  <select v-model="transaction.tokenInfo">
                    <option value="">ETH</option>
                    <option
                      :value="token"
                      v-for="token in tokens"
                      :key="token.address">{{token.symbol}}</option>
                  </select>
                </span>
              </v-input>
            </div>
            <div class="column is-half is-full-mobile">
              <v-input v-model.number="price"
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
                       name="limit"
                       type="number"
                       v-validate="'required|numeric|integer|between:21000,4000000'"
                       id="limit"
                       aria-describedby="limit"
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
import { mapFields } from 'vee-validate';
import { mapState, mapMutations } from 'vuex';
import VForm from '@/components/ui/form/VForm.vue';
import VInput from '@/components/ui/form/VInput.vue';
import VButton from '@/components/ui/form/VButton.vue';
import TransactionModal from '@/components/modal/TransactionModal';

export default {
  data: () => ({
    selectedToken: 'ETH',
    toCache: '',
    isSending: false,
    transactionHash: null,
    transaction: new Transaction({
      gasPrice: '90',
      gasLimit: '22000',
      value: '0',
      to: '',
      data: '0x'
    }),
    estimateGas: 0,
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
    price: {
      get() {
        if(!this.ethPrice)
          return
        let price = new BigNumber(this.ethPrice);
        let number = new BigNumber(this.transaction.value).times(price).toFixed(2);
        return number
      },
      set(newValue) {
        if (typeof newValue !== 'number') return;
        let ethPrice = new BigNumber(this.ethPrice);
        let fiatAmount = new BigNumber(newValue);
        this.transaction.value = fiatAmount.div(ethPrice).toFixed(18)
      }
    },
    maxAmount() {
      if (!this.transaction.tokenInfo) {
        const balanceBN = BigNumber(this.balance || '0');
        const estimateGasBN = BigNumber(this.estimateGas || '0');
        const amountBN = balanceBN.minus(estimateGasBN);
        const amount = amountBN.toFixed();
        return amount > 0 ? amount : 0;
      } else {
        return this.transaction.tokenInfo.balance;
      }
    },
    maxPrice() {
      const balance = new BigNumber(this.maxAmount);
      const price = new BigNumber(this.price);
      const amount = balance.times(price).toFixed();
      return amount > 0 ? amount : 0;
    }
  },
  methods: {
    ...mapMutations('accounts', ['addTransaction']),
    sendTransaction() {
      this.isSending = true;
      this.transaction.from = this.address
      this.web3.eth.getTransactionCount(this.address).then(nonce => {
        this.transaction.nonce = (nonce + this.pendingTransactions.length).toString();
        const web3Transaction = new Tx(this.transaction.getApiObject(this.web3.eth));
        web3Transaction.sign(this.account.getPrivateKey());
        const serializedTx = web3Transaction.serialize();
        this.addTransaction(this.transaction);

        const sendEvent = this.web3.eth
          .sendSignedTransaction('0x' + serializedTx.toString('hex'))
          .on('confirmation', (confNumber, { transactionHash }) => {
            if (confNumber > 0) {
              sendEvent.off('confirmation')
              this.transaction.state = 'success'
            }
          })
          .on('error', (err, receipt) => {
            this.$validator.flag('address', {
              valid: false,
            });
            this.isSending = false;

            const cause = receipt ? ', because out of gas' : '';

            this.$notify({
              title: 'Error sending transaction',
              text: `Transaction was not sent${cause}`,
              type: 'is-danger',
            });

            console.error(err)
          })
          .on('transactionHash', hash => {
            this.$validator.flag('address', {
              valid: false,
            });
            this.isSending = false;
            this.transaction.state = 'pending';
            this.transaction.hash = hash;
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
    async updateEstimateGas() {
      this.estimateGas = await this.transaction.getFullPrice(this.web3.eth);
    }
  },
  watch: {
    'transaction.to': {
      async handler() {
        await this.$nextTick();
        await this.$nextTick();

        if (!this.errors.has('address')) {
          this.updateEstimateGas();
        }
      },
      immediate: true,
    },
    'transaction.data': {
      async handler() {
        await this.$nextTick();
        await this.$nextTick();

        if (!this.errors.has('data')) {
          this.updateEstimateGas();
        }
      },
    },
    selectedToken() {
      this.updateEstimateGas();
    }
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
