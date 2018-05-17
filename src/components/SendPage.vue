<template>
  <div class="send-page">
    <div class="section">
      <div class="container">
        <h1 class="title">Send ETH</h1>
        <form id="sendEther" @submit="sendTransaction">

          <div class="field">
            <label class="label" for="address">To</label>
            <div class="control">
              <input v-model="transaction.to" name="address" v-validate="'required|address'" type="text" class="input"
                :class="{'is-danger': fields.address && fields.address.touched && fields.address.invalid }" id="address" aria-describedby="address" placeholder="Receiver address" required>
            </div>
            <p class="help is-danger">{{errors.first('address')}}</p>
          </div>

          <div class="field">
            <label class="label" for="value">Amount</label>
          </div>
          <div class="field has-addons">
            <div class="control is-expanded">
              <input v-model.number="value" name="value" type="text" class="input" id="value" aria-describedby="value" placeholder="Amount" required>
            </div>
            <div class="control">
              <span class="select">
                <select v-model="selectedToken">
                  <option value="ETH">ETH</option>
                  <option :value="token" v-for="token in tokens" :key="token.address">{{token.symbol}}</option>
                </select>
              </span>
            </div>
          </div>

          <div class="field">
            <label class="label" for="price">Gas price</label>
          </div>
          <div class="field has-addons">
            <div class="control is-expanded">
              <input v-model.number="gasPrice" name="price" type="text" class="input"
               id="price" aria-describedby="price" placeholder="Gas price" required>
            </div>
            <div class="control">
              <a class="button is-static">Gwei</a>
            </div>
          </div>

          <div class="field">
            <label class="label" for="limit">Gas limit</label>
            <div class="control">
              <input v-model.number="gasLimit" type="text" class="input"
              id="limit" aria-describedby="limit" placeholder="Gas limit" required>
            </div>
          </div>

          <div class="field">
            <div class="control">
              <button :disabled="fields.address && fields.address.invalid ||
              fields.limit && fields.limit.invalid ||
              fields.value && fields.value.invalid ||
              fields.price && fields.price.invalid" class="button is-primary
                                             is-medium"
                @click.prevent="sendTransaction">Send</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>

import erc20ABI from '@/erc20.json'
import web3 from 'web3';
import Tx from 'ethereumjs-tx';
import { mapFields } from 'vee-validate'


export default {

  data () {
    return {
      selectedToken: 'ETH',
      validForm:false,
      toCache: '',
      transaction: {
        gasPrice: '0x14f46b0400',
        gasLimit: '0x55f0',
        to: '',
        value: '0x0',
        data: '0x0'
      },
      activeErrors: {
        gasPrice: [],
        gasLimit: [],
        to: [],
        value: []
      },
      dirty: {
        gasPrice: false,
        gasLimit: false,
        to: false,
        value: false
      }
    }
  },
  computed : {
    gasPrice: {
      get: function () {
        return web3.utils.fromWei(web3.utils.hexToNumberString(this.transaction.gasPrice), 'Gwei');
      },
      set: function (newValue) {
        if( typeof newValue !== 'number')
          return
        this.transaction.gasPrice = web3.utils.numberToHex(web3.utils.toWei(newValue.toString(), 'Gwei'));
      }
    },
    tokens() {
      return this.$store.state.tokens.activeTokens;
    },
    gasLimit: {
      get: function () {
        return web3.utils.hexToNumberString(this.transaction.gasLimit);
      },
      set: function (newValue) {
        if( typeof newValue !== 'number')
          return
        this.transaction.gasLimit = web3.utils.numberToHex(newValue.toString());
      }
    },
    value: {
      get: function () {
        if( this.selectedToken === 'ETH') {
          return web3.utils.fromWei(web3.utils.hexToNumberString(this.transaction.value));
        }
        else {
          let value = web3.utils.hexToNumberString(this.transaction.value);
          let BN = web3.utils.BN;
          let divider = new BN('10');
          divider = divider.pow(new BN(this.selectedToken.decimals));
          let result = new BN (value);
          let beforeDecimal = result.div(divider);
          let afterDecimal  = result.mod(divider);
          return beforeDecimal.toString() + '.' + afterDecimal.toString();
        }
      },
      set: function (newValue) {
        if( typeof newValue !== 'number')
          return
        if(this.selectedToken === "ETH")
          this.transaction.value = web3.utils.numberToHex(web3.utils.toWei(newValue.toString(), 'ether'));
        else {
          let BN = web3.utils.BN;
          let value = new BN(newValue);
          let divider = new BN('10');
          divider = divider.pow(new BN(this.selectedToken.decimals));
          value = value.mul(divider);
          this.transaction.value = web3.utils.numberToHex(value.toString());
        }

      }
    },
    message: {
      get: function () {
        return web3.utils.hexToUtf8(this.transaction.message);
      },
      set: function (newValue) {
        this.transaction.message = web3.utils.utf8ToHex(newValue);
      }
    }
  },
  watch: {
    activeErrors: {
      handler() {
        this.validForm = !this.activeErrors.value.length &&
        !this.activeErrors.to.length &&
        !this.activeErrors.gasLimit.length &&
        !this.activeErrors.gasPrice.length;
      },
      deep: true
    }
  },
  methods: {
    chreateTransactionHistory(trx) {
      let historyItem = {};
      historyItem.to = trx.to;
      historyItem.value = web3.utils.fromWei(web3.utils.hexToNumberString(trx.value));
      historyItem.gasLimit = trx.gasLimit;
      historyItem.gasPrice = trx.gasPrice;
      historyItem.nonce = trx.nonce;
      historyItem.canseled = false;
      if(this.selectedToken !== 'ETH') {
        historyItem.reciverAddress = this.toCache;
        historyItem.tokenInfo = this.selectedToken;
      }
      return historyItem;
    },
    sendTransaction(e) {
      let keyHex = this.$store.state.accounts.activeAccount.getAddressString();
      this.$store.state.web3.web3.eth.getTransactionCount(keyHex).then((nonce) => {
        let nonceWithPending = nonce + this.$store.state.accounts.pendingTransactions.length;
        this.transaction.nonce = web3.utils.numberToHex(nonceWithPending);
        if(this.selectedToken !== 'ETH') {
          this.createTokenTransaction()
        }
        let tx = new Tx(this.transaction);
        tx.sign(this.$store.state.accounts.activeAccount.getPrivateKey());
        var serializedTx = tx.serialize();
        let transactionForHistory = this.chreateTransactionHistory(this.transaction);

        this.$store.state.web3.web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
        .on('receipt', (resp) => {
          this.$store.commit('accounts/removeTransaction', resp.transactionHash);
        })
        .on('error', (err) => {
        })
        .on('transactionHash', (hash) => {
          transactionForHistory.hash = hash;
          this.$store.commit('accounts/addTransaction', transactionForHistory);
        });
        this.transaction.to = this.toCache;
      });
      e.preventDefault();
    },
    createTokenTransaction() {
      let tokenAddress = this.selectedToken.address;
      let address = this.$store.state.accounts.activeAccount.getAddressString();
      var contract = new this.$store.state.web3.web3.eth.Contract(erc20ABI, tokenAddress, { from: address });
      this.toCache = this.transaction.to;
      this.transaction.to = tokenAddress;
      this.transaction.data = contract.methods.transfer(this.transaction.to, this.transaction.value).encodeABI();
    }
  }
}
</script>

<style lang="scss">
</style>
