<template lang="html">
  <div class="transaction" :class="'is-'+statusText">
    <div class="card">
      <div class="card-header">
        <p class="card-header-title">
        {{transaction.hash}}
        </p>
        <div class="card-header-icon" :title="statusText">
          <span v-if="transaction.success" class="icon has-text-success is-medium"
                v-html="require('@/img/circle-check.svg')"></span>
          <span v-else-if="transaction.canseled" class="icon
                                                 has-text-danger is-medium"
                v-html="require('@/img/ban.svg')"></span>
          <span v-else-if="transaction.isPending" class="icon is-medium"
                v-html="require('@/img/ellipses.svg')"></span>
        </div>
      </div>
      <div class="card-content">
        <div class="columns">
          <div class="column">
            <span class="heading">{{statusText}}</span>
            <p v-if="date">
              <span class="text-label">Date</span>
              <span class="date">{{date}}</span>
            </p>

            <p v-if="recieve">
              <span class="text-label">From</span>
              <span class="address">{{transaction.from}}</span>
            </p>
            <p v-else>
              <span class="text-label">To</span>
              <span class="address"  v-if="transaction.reciverAddress">{{transaction.reciverAddress}}</span>
              <span class="address" v-else>{{transaction.to}}</span>
            </p>
            <p v-if="transaction.data || transaction.iput">
              {{parsePata(data)}}
            </p>
          </div>

          <div class="column is-one-third">
            <p>
              <span class="title amount" v-if="transaction.tokenInfo">{{parseTokenAmount()}}</span>
              <span class="title amount" v-else>{{transaction.value}}</span>
              <span v-if="transaction.tokenInfo">{{transaction.tokenInfo.symbol}}</span>
              <span v-else>ETH</span>
            </p>
            <p class="received" v-if="recieve">
              <span class="icon is-medium"
                    v-html="require('@/img/arrow-thick-right.svg')"></span>
              <span class="heading">Received</span>
            </p>
            <p class="sent" v-else>
              <span class="icon is-medium"
                    v-html="require('@/img/arrow-thick-left.svg')"></span>
              <span class="heading">Sent</span>
            </p>
          </div>
        </div>
      </div>
      <div v-if="isPending  && !isPublicAccount" class="card-footer">
        <a class="card-footer-item" @click="resend" :disabled="isSyncing">
          <span class="icon is-medium"
                v-html="require('@/img/loop.svg')"></span>Resend
        </a>
        <a class="card-footer-item has-text-danger" @click="cansel" :disabled="isSyncing"
         type="button" name="button">
          <span class="icon is-medium"
                v-html="require('@/img/ban.svg')"></span>Cancel
        </a>
      </div>
    </div>

    <resend-modal :transaction="transaction" v-if="resendModalOpen" @close="closeResendModal"/>
  </div>
</template>

<script>
import web3 from 'web3';
import Tx from 'ethereumjs-tx';
import ResendModal from './ResendModal';
import accounts from '@/mixins/accounts'
import { mapState } from 'vuex';
import { mapGetters } from 'vuex'


window.web3 = web3
export default {
  props: ['transaction'],
  data () {
    return {
      resendModalOpen: false
    }
  },
  computed: {
    ...mapState({
      isSyncing: state => state.web3.isSyncing,
    }),
    ...mapGetters('accounts', ['isPublicAccount']),
    recieve() {
      return this.transaction.to === this.address;
    },
    date() {
      if(this.transaction.timestamp) {
        const date = new Date(this.transaction.timestamp*1000);
        return date.toLocaleString();
      } else {
        return false;
      }
    },
    isPending () {
      return !this.date && !this.transaction.canseled
    },
    statusText () {
      if (this.transaction.canseled) {
        return 'cancelled'
      } else if (this.isPending) {
        return 'pending'
      } else {
        return 'confirmed'
      }
    }
  },
  methods: {
    resend() {
      this.resendModalOpen = true
    },
    closeResendModal() {
      this.resendModalOpen = false
    },
    cansel() {
      if(this.transaction.date)
        return;
      const canselTransaction = {};
      Object.assign(canselTransaction, this.transaction);
      canselTransaction.value = web3.utils.numberToHex('0');
      canselTransaction.to = this.address()
      let initialGwei = parseInt(web3.utils.fromWei(web3.utils.hexToNumberString(canselTransaction.gasPrice), 'Gwei'), 10);
      canselTransaction.gasPrice = web3.utils.numberToHex(web3.utils.toWei((initialGwei + 1).toString(),'Gwei'));
      canselTransaction.gasLimit = canselTransaction.gasLimit;
      delete canselTransaction.hash
      let tx = new Tx(canselTransaction);
      tx.sign(this.activeAccount.getPrivateKey());
      var serializedTx = tx.serialize();
      this.$store.state.web3.web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
      .on('transactionHash', (hash) => {
        this.$store.commit('accounts/canselTransaction', this.transaction.hash);
      });
    },
    parseTokenAmount() {
      let BN = web3.utils.BN;
      let divider = new BN('10');
      divider = divider.pow(new BN(this.transaction.tokenInfo.decimals));
      let result = new BN (this.transaction.value);
      let beforeDecimal = result.div(divider);
      let afterDecimal  = result.mod(divider);
      return beforeDecimal.toString() + '.' + afterDecimal.toString();
    },
    parsePata() {
      let dataString = this.transaction.data || this.transaction.input || '0x';
      return web3.utils.hexToString(dataString);
    }
  },
  updated () {
    console.log(this.transaction)
  },
  components: {
    ResendModal
  },
  mixins: [accounts]
}
</script>

<style lang="scss">
.transaction {
  margin-bottom: 2rem;
  .card {
    border-top: 5px solid $white;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  &.is-cancelled .card {
    border-top-color: $danger;
    .card-header-icon .icon svg {
      fill: $danger;
    }
    .status-text {
      color: $danger;
    }
  }
  &.is-pending .card {
    border-top-color: $warning;
    .card-header-icon .icon svg {
      fill: $warning;
    }
    .status-text {
      color: $warning;
    }
  }
  &.is-confirmed .card {
    border-top-color: $success;
    .card-header-icon .icon svg {
      fill: $success;
    }
    .status-text {
      color: $success;
    }
  }

  .received {
    .icon svg {
      fill: $success;
    }
  }
  .sent {
    .icon svg {
      fill: $danger;
    }
  }

  .text-label {
    color: lighten($dark-grey, 20%);
    margin-right: 0.2em;
  }
}
</style>
