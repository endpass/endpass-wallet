<template>
  <div class="app-page send-page">
    <div class="section">
      <div class="container is-narrow">
        <div class="card app-card main-app-card">
          <div class="card-header">
            <h1 class="card-header-title">Send ETH</h1>
          </div>
          <div class="card-content">
            <form id="sendEther" @submit="sendTransaction">

              <div class="field">
                <label class="label" for="address">To</label>
                <div class="control">
                  <input
                    v-model="transaction.to"
                    name="address"
                    v-validate="'required|address'"
                    class="input"
                    :class="{'is-danger': errors.has('address') }"
                    id="address"
                    type="text"
                    aria-describedby="address"
                    placeholder="Receiver address"
                    required>
                </div>
                <p class="help is-danger"
                  v-if="errors.has('address')">{{errors.first('address')}}</p>
              </div>

              <div class="field">
                <label class="label" for="value">Amount</label>
              </div>
              <div class="field has-addons">
                <div class="control is-expanded">
                  <input
                    v-model.number="value"
                    name="value"
                    type="text"
                    class="input"
                    id="value"
                    aria-describedby="value"
                    placeholder="Amount"
                    required>
                </div>
                <div class="control">
                  <span class="select">
                    <select v-model="selectedToken">
                      <option value="ETH">ETH</option>
                      <option
                        :value="token.symbol"
                        v-for="token in tokens"
                        :key="token.address">{{token.symbol}}</option>
                    </select>
                  </span>
                </div>
              </div>

              <div class="field">
                <label class="label" for="price">Gas price</label>
              </div>
              <div class="field has-addons">
                <div class="control is-expanded">
                  <input
                    v-model.number="gasPrice"
                    name="price"
                    type="text"
                    class="input"
                    id="price"
                    aria-describedby="price"
                    placeholder="Gas price"
                    required>
                </div>
                <div class="control">
                  <a class="button is-static">Gwei</a>
                </div>
              </div>

              <div class="field">
                <label class="label" for="limit">Gas limit</label>
                <div class="control">
                  <input
                    v-model.number="gasLimit"
                    type="text" class="input"
                    id="limit"
                    aria-describedby="limit"
                    placeholder="Gas limit"
                    required>
                </div>
              </div>
              <div class="field" v-show="selectedToken === 'ETH'">
                <label class="label" for="data">Data</label>
                <div class="control">
                  <input
                    v-model="transaction.data"
                    type="text" class="input"
                    aria-describedby="data"
                    placeholder="Data"
                    required>
                </div>
              </div>

              <div class="field">
                <div class="control">
                  <button :disabled="!isFormValid"
                    class="button is-primary is-medium"
                    @click.prevent="sendTransaction">Send</button>
                </div>
              </div>
            </form>
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

const { BN, fromWei, hexToNumberString, numberToHex, toWei } = web3.utils;

export default {
  data: () => ({
    selectedToken: 'ETH',
    toCache: '',
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
    isFormValid() {
      return !Object.keys(this.fields).some(
        field => this.fields[field] && this.fields[field].invalid
      );
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
          .on('error', err => {})
          .on('transactionHash', hash => {
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
  mixins: [accounts],
};
</script>

<style lang="scss">
</style>
