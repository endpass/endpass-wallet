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

              <v-input v-model="transaction.value"
                       label="Amount"
                       type="number"
                       name="value"
                       v-validate="`required|decimal|max_value:${maxAmount}`"
                       data-vv-as="amount"
                       id="value"
                       aria-describedby="value"
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

              <v-input v-model="transaction.gasPrice"
                       label="Gas price"
                       name="price"
                       type="number"
                       v-validate="'required|integer|min_value:0|max_value:100'"
                       id="price"
                       aria-describedby="price"
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
                       v-validate="'required|numeric|integer|min_value:21000|max_value:4000000'"
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

              <v-button @click.prevent="sendTransaction"
                        className="is-primary is-medium"
                        :loading="isSending"
                        :disabled="isSyncing">Send</v-button>

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

const { BN, toBN, fromWei, hexToNumberString, numberToHex, toWei } = web3.utils;

export default {
  data: () => ({
    selectedToken: 'ETH',
    toCache: '',
    isSending: false,
    transactionHash: null,
    transaction: {
      gasPrice: '90',
      gasLimit: '22000',
      value: '0',
      to: '',
      data: '0x',
      nonce: '',
    },
    estimateGas: 0,
  }),
  computed: {
    ...mapState({
      pendingTransactions: state => state.accounts.pendingTransactions,
      tokens: state => state.tokens.activeTokens,
      web3: state => state.web3.web3,
      isSyncing: state => !!state.web3.isSyncing,
    }),
    // token object based on the selectedToken symbol string
    selectedTokenInfo() {
      return this.tokens.find(t => t.symbol === this.selectedToken);
    },
    maxAmount() {
      if (this.selectedToken === 'ETH') {
        const { gasPrice } = this.transaction;
        const balanceBN = toBN(toWei(this.balance || '0'));
        const gasPriceBN = toBN(toWei(gasPrice || '0', 'Gwei'));
        const estimateGasBN = toBN(this.estimateGas);
        const amountBN = balanceBN.sub(gasPriceBN.mul(estimateGasBN));
        const amount = fromWei(amountBN.toString());
        return amount > 0 ? amount : 0;
      } else {
        return this.selectedTokenInfo.balance;
      }
    },
    divider() {
      return toBN('10').pow(toBN(this.selectedTokenInfo.decimals || '0'));
    },
    transactionData() {
      let {
        to,
        data,
        nonce,
        value: tnxValue,
        gasPrice,
        gasLimit,
      } = this.transaction;
      let value = numberToHex(toWei(tnxValue || '0'));

      if (to && to.toUpperCase().indexOf('0X') !== 0) {
        to = `0x${to}`;
      }

      if (this.selectedToken !== 'ETH') {
        if (!this.selectedTokenInfo || !this.selectedTokenInfo.address) {
          throw 'Invalid token address';
        }

        this.toCache = to;
        const { address } = this.selectedTokenInfo;
        to = address;
        const contract = new this.web3.eth.Contract(erc20ABI, address, {
          from: this.address,
        });
        const beforeDec = tnxValue.split('.')[0] || '';
        const afterDec = tnxValue.split('.')[1] || '';
        const afterNew =
          afterDec + this.divider.toString().slice(afterDec.length + 1);
        value = numberToHex(Number(beforeDec + afterNew));
        data = contract.methods.transfer(to, value).encodeABI();
      }

      return {
        from: this.address,
        to: to || undefined,
        value,
        gasPrice: numberToHex(toWei(gasPrice || '0', 'Gwei')),
        gasLimit: numberToHex(gasLimit || '0'),
        data: data || '0x',
        nonce: numberToHex(nonce || 0),
      };
    },
  },
  methods: {
    ...mapMutations('accounts', ['addTransaction', 'updateTransaction']),
    createTransactionHistory(trx) {
      const historyItem = {};

      historyItem.to = trx.to;
      historyItem.value = fromWei(hexToNumberString(trx.value));
      historyItem.gasLimit = trx.gasLimit;
      historyItem.gasPrice = trx.gasPrice;
      historyItem.nonce = trx.nonce;
      historyItem.canseled = false;
      historyItem.token = this.selectedToken;
      historyItem.status = 'pending';

      if (this.selectedToken !== 'ETH') {
        historyItem.reciverAddress = this.toCache;
        historyItem.tokenInfo = this.selectedTokenInfo;
        historyItem.value = toBN(hexToNumberString(trx.value))
          .div(this.divider)
          .toString();
      }

      return historyItem;
    },
    sendTransaction() {
      const keyHex = this.address;
      this.isSending = true;

      this.web3.eth.getTransactionCount(keyHex).then(nonce => {
        const nonceWithPending = nonce + this.pendingTransactions.length;
        this.transaction.nonce = numberToHex(nonceWithPending);

        const tx = new Tx(this.transactionData);
        tx.sign(this.activeAccount.getPrivateKey());
        const serializedTx = tx.serialize();
        const transactionForHistory = this.createTransactionHistory(
          this.transactionData
        );

        this.web3.eth
          .sendSignedTransaction('0x' + serializedTx.toString('hex'))
          .on('receipt', resp => {
            this.updateTransaction({
              oldHash: resp.transactionHash,
              newTrx: { status: 'success' },
            });
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
    async updateEstimateGas() {
      let { data, to, value, gasLimit, gasPrice } = this.transactionData;

      this.estimateGas = await this.web3.eth.estimateGas({
        to,
        value: hexToNumberString(value),
        data,
      })
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
  },
  mixins: [accounts],
};
</script>

<style lang="scss">
</style>
