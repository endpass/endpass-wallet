<template>
  <div class="app-page send-page">
    <div class="section">
      <div class="container is-narrow">
        <div class="card app-card main-app-card">
          <div class="card-header">
            <h1 class="card-header-title">Send ETH</h1>
          </div>
          <div class="card-content">
            <v-form id="sendEther"
                    v-model="isFormValid">

              <v-input v-model="transaction.to"
                       label="To"
                       name="address"
                       v-validate="'required|address'"
                       :error="errors.first('address')"
                       id="address"
                       describe="address"
                       placeholder="Receiver address"
                       :disabled="isSending"
                       required />

              <v-input v-model.number="value"
                       label="Amount"
                       name="value"
                       v-validate="`required|decimal|max_value:${maxAmount}`"
                       :error="errors.first('value')"
                       id="value"
                       describe="value"
                       placeholder="Amount"
                       :disabled="isSending"
                       required>
                <span class="select" slot="addon">
                  <select v-model="selectedToken">
                    <option value="ETH">ETH</option>
                    <option
                      :value="token.symbol"
                      v-for="token in tokens"
                      :key="token.address">{{token.symbol}}</option>
                  </select>
                </span>
              </v-input>

              <v-input v-model.number="gasPrice"
                       label="Gas price"
                       name="price"
                       v-validate="'required|integer|min_value:0|max_value:100'"
                       :error="errors.first('price')"
                       id="price"
                       describe="price"
                       placeholder="Gas price"
                       :disabled="isSending"
                       required>
                <div class="control" slot="addon">
                  <a class="button is-static">Gwei</a>
                </div>
              </v-input>

              <v-input v-model.number="gasLimit"
                       label="Gas limit"
                       name="limit"
                       v-validate="'required|numeric|integer|min_value:21000|max_value:4000000'"
                       :error="errors.first('limit')"
                       id="limit"
                       describe="limit"
                       placeholder="Gas limit"
                       :disabled="isSending"
                       required />

              <v-input v-show="selectedToken === 'ETH'"
                       v-model="transaction.data"
                       label="Data"
                       id="data"
                       describe="data"
                       placeholder="Data"
                       :disabled="isSending"
                       required />

              <v-button @click.prevent="sendTransaction"
                        :loading="isSending"
                        :disabled="!isFormValid || isSyncing">Send</v-button>

              <div v-if="transactionHash">{{ transactionHash }}</div>
            </v-form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import erc20ABI from '@/erc20.json';
import web3 from 'web3';
import Tx from 'ethereumjs-tx';
import { mapFields } from 'vee-validate';
import { mapState, mapMutations } from 'vuex';
import accounts from '@/mixins/accounts';
import VForm from '@/components/ui/form/VForm.vue';
import VInput from '@/components/ui/form/VInput.vue';
import VButton from '@/components/ui/form/VButton.vue';

const { BN, fromWei, hexToNumberString, numberToHex, toWei } = web3.utils;

export default {
  data: () => ({
    selectedToken: 'ETH',
    toCache: '',
    maxAmount: 0,
    isSending: false,
    isFormValid: false,
    transactionHash: null,
    transaction: {
      gasPrice: '0x14f46b0400',
      gasLimit: '0x55f0',
      to: '',
      value: '0x0',
      data: '0x',
    },
  }),
  computed: {
    ...mapState({
      pendingTransactions: state => state.accounts.pendingTransactions,
      tokens: state => state.tokens.activeTokens,
      web3: state => state.web3.web3,
      isSyncing: state => state.web3.isSyncing,
    }),
    gasPrice: {
      get() {
        return fromWei(hexToNumberString(this.transaction.gasPrice), 'Gwei');
      },
      set(newValue) {
        if (typeof newValue !== 'number') return;

        this.transaction.gasPrice = numberToHex(
          toWei(newValue.toString(), 'Gwei')
        );
      },
    },
    // token object based on the selectedToken symbol string
    selectedTokenInfo() {
      return this.tokens.find(t => t.symbol === this.selectedToken);
    },
    gasLimit: {
      get() {
        return hexToNumberString(this.transaction.gasLimit);
      },
      set(newValue) {
        if (typeof newValue !== 'number') return;

        this.transaction.gasLimit = numberToHex(newValue.toString());
      },
    },
    value: {
      get() {
        const { value: transValue } = this.transaction;

        if (this.selectedToken === 'ETH') {
          return fromWei(hexToNumberString(transValue));
        } else {
          const divider = new BN('10').pow(
            new BN(this.selectedTokenInfo.decimals)
          );
          const result = new BN(hexToNumberString(transValue));
          const beforeDecimal = result.div(divider).toString();
          const afterDecimal = result.mod(divider).toString();

          return `${beforeDecimal}.${afterDecimal}`;
        }
      },
      set(newValue) {
        if (typeof newValue !== 'number') return;

        if (this.selectedToken === 'ETH') {
          this.transaction.value = numberToHex(
            toWei(newValue.toString(), 'ether')
          );
        } else {
          const divider = new BN('10').pow(
            new BN(this.selectedTokenInfo.decimals)
          );
          const value = new BN(newValue).mul(divider).toString();
          this.transaction.value = numberToHex(value);
        }
      },
    },
  },
  methods: {
    ...mapMutations('accounts', ['addTransaction', 'removeTransaction']),
    createTransactionHistory(trx) {
      const historyItem = {};

      historyItem.to = trx.to;
      historyItem.value = fromWei(hexToNumberString(trx.value));
      historyItem.gasLimit = trx.gasLimit;
      historyItem.gasPrice = trx.gasPrice;
      historyItem.nonce = trx.nonce;
      historyItem.canseled = false;

      if (this.selectedToken !== 'ETH') {
        historyItem.reciverAddress = this.toCache;
        historyItem.tokenInfo = this.selectedTokenInfo;
      }

      return historyItem;
    },
    sendTransaction() {
      const keyHex = this.address;
      this.isSending = true;

      this.web3.eth.getTransactionCount(keyHex).then(nonce => {
        const nonceWithPending = nonce + this.pendingTransactions.length;
        this.transaction.nonce = numberToHex(nonceWithPending);
        if (this.selectedToken !== 'ETH') {
          this.createTokenTransaction();
        }
        const tx = new Tx(this.transaction);
        tx.sign(this.activeAccount.getPrivateKey());
        const serializedTx = tx.serialize();
        const transactionForHistory = this.createTransactionHistory(
          this.transaction
        );

        this.web3.eth
          .sendSignedTransaction('0x' + serializedTx.toString('hex'))
          .on('receipt', resp => {
            this.removeTransaction(resp.transactionHash);
          })
          .on('error', (err, receipt) => {
            this.isSending = false;

            const cause = receipt ? ', because out of gas' : null;

            this.$notify({
              title: 'Error sending transaction',
              text: `Transaction was not sent${cause}`,
              type: 'is-danger',
            })
          })
          .on('transactionHash', hash => {
            this.isSending = false;
            this.transactionHash = hash;
            this.$notify({
              title: 'Successful',
              text: 'Transaction was sent',
              type: 'is-info',
            })

            transactionForHistory.hash = hash;
            this.addTransaction(transactionForHistory);
          });

        this.transaction.to = this.toCache;
      });
    },
    createTokenTransaction() {
      if (!this.selectedTokenInfo || !this.selectedTokenInfo.address) {
        throw 'Invalid token address';
      }

      const tokenAddress = this.selectedTokenInfo.address;
      const contract = new this.web3.eth.Contract(erc20ABI, tokenAddress, {
        from: this.address,
      });
      this.toCache = this.transaction.to;
      this.transaction.to = tokenAddress;
      this.transaction.data = contract.methods
        .transfer(this.transaction.to, this.transaction.value)
        .encodeABI();
    },
  },
  watch: {
    'transaction.to': {
      async handler() {
        await this.$nextTick();

        if (!this.errors.has('address')) {
          const gas = await this.web3.eth.estimateGas({
            to: this.transaction.to || undefined,
            amount: hexToNumberString(this.transaction.value),
          })
          
          const amountWei = toWei(this.balance, 'ether') - gas;
          this.maxAmount = fromWei(amountWei.toString());
        }
      },
      immediate: true
    }
  },
  components: {
    VForm,
    VButton,
    VInput,
  },
  mixins: [accounts],
};
</script>

<style lang="scss">
</style>
