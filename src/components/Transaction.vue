<template lang="html">
  <div class="transaction" :class="statusClass">
    <div class="transaction-header">
      <account :address="txAddress" :balance="transaction.value"
        :currency="symbol" :size="8">
      <p v-if="recieve">
        Received
        <span class="icon status-icon is-small"
              v-html="require('@/img/arrow-thick-right.svg')"></span>
        <span class="date">{{date.fromNow()}}</span>
      </p>
      <p v-else>
        Sent
        <span class="icon status-icon is-small"
              v-html="require('@/img/arrow-thick-left.svg')"></span>
        <span class="date">{{date.fromNow()}}</span>
      </p>
      <div class="transaction-actions level is-mobile">
        <div class="level-left">
          <a class="level-item" v-if="transaction.state === 'pending'  && !isPublicAccount" @click="resend" :disabled="isSyncing">
            <span class="icon is-small"
                  v-html="require('@/img/loop.svg')"></span>Resend
          </a>
          <a class="level-item has-text-danger" v-if="transaction.state === 'pending'  && !isPublicAccount" @click="cancel" :disabled="isSyncing" >
            <span class="icon is-small"
                  v-html="require('@/img/ban.svg')"></span>Cancel
          </a>
        </div>
        <div class="level-right">
          <a @click="toggleExpanded" class="level-item">
            <span class="icon is-small"
                  v-html="require('@/img/ellipses.svg')"></span>
            Details</a>
        </div>
      </div>
      </account>
    </div>

    <div class="transaction-detail" v-if="isExpanded">
      <div v-if="transaction.hash.length">
        <span class="text-label">Txid</span>
        <p class="code">{{transaction.hash}}</p>
      </div>
      <div>
        <span class="heading status-text">{{transaction.state}}</span>
      </div>

      <div v-if="date">
        <span class="text-label">Date</span>
        <p class="date">{{date.format("YYYY-MM-DD H:mm")}}</p>
      </div>

      <div v-if="recieve">
        <span class="text-label">From</span>
        <p class="code address">{{transaction.from}}</p>
      </div>

      <div v-else>
        <span class="text-label">To</span>
        <p class="code address">{{transaction.to}}</p>
      </div>

      <div>
        <span class="text-label">Nonce</span>
        <span class="">{{transaction.nonce}}</span>
      </div>

      <div v-if="transaction.data">
        <span class="text-label">Data</span>
        <span class="code">
          {{parseData(transaction.data)}}
        </span>
      </div>
    </div>





    <resend-modal :transaction="transactionToSend" v-if="resendModalOpen" @close="closeResendModal" @confirm="confirmResend"/>
    <password-modal v-if="passwordModalOpen" @close="closePassword" @confirm="confirmPassword"/>
  </div>
</template>

<script>
import Account from '@/components/Account';
import web3 from 'web3';
import Tx from 'ethereumjs-tx';
import { Transaction } from '@/class';
import ResendModal from './ResendModal';
import PasswordModal from '@/components/modal/PasswordModal';
import { mapState, mapGetters, mapActions } from 'vuex';
import error from '@/mixins/error';
import moment from 'moment';
window.web3 = web3;

export default {
  props: {
    transaction: {
      required: true,
    },
  },
  data() {
    return {
      resendModalOpen: false,
      passwordModalOpen: false,
      isExpanded: false, // details are expanded
      transactionToSend: null,
      state: null,
    };
  },
  computed: {
    ...mapState({
      isSyncing: state => state.web3.isSyncing,
      web3: state => state.web3.web3,
      address: state =>
        state.accounts.address && state.accounts.address.getAddressString(),
    }),
    ...mapGetters('accounts', ['isPublicAccount']),
    recieve() {
      return this.transaction.to === this.address;
    },
    isSuccess() {
      return this.transaction.state === 'success';
    },
    isError() {
      return (
        this.transaction.state === 'error' ||
        this.state === 'error' ||
        this.state === 'canceled'
      );
    },
    isPending() {
      return this.transaction.state === 'pending';
    },
    // Dynamic class based on transaction status
    statusClass() {
      return {
        'is-success': this.isSuccess,
        'is-warning': this.isPending,
        'is-danger': this.isError,
        'is-received': this.recieve,
        'is-sent': !this.recieve,
      };
    },
    symbol() {
      return (
        (this.transaction.tokenInfo && this.transaction.tokenInfo.symbol) ||
        'ETH'
      );
    },
    // Returns date as a moment.js object
    date() {
      return moment(this.transaction.date);
    },
    // To/from address of transaction
    txAddress() {
      if (this.recieve) {
        return this.transaction.from;
      } else {
        return this.transaction.to;
      }
    },
  },
  methods: {
    ...mapActions('transactions', ['resendTransaction', 'cancelTransaction']),
    resend() {
      this.transactionToSend = this.transaction.clone();
      this.resendModalOpen = true;
      this.state = 'resent';
    },
    requestPassword() {
      this.passwordModalOpen = true;
    },
    closePassword() {
      this.passwordModalOpen = false;
    },
    confirmPassword(password) {
      this.resendModalOpen = false;
      this.passwordModalOpen = false;

      const sendTransaction =
        this.state === 'canceled'
          ? this.cancelTransaction
          : this.resendTransaction;

      sendTransaction({ transaction: this.transactionToSend, password })
        .then(() => {
          this.$notify({
            title: 'Successful',
            text: `Transaction was ${this.state}`,
            type: 'is-info',
          });
          this.state = null;
        })
        .catch(() => {});
    },
    confirmResend(transaction) {
      this.transactionToSend = transaction;
      this.requestPassword();
    },
    toggleExpanded() {
      this.isExpanded = !this.isExpanded;
    },
    closeResendModal() {
      this.resendModalOpen = false;
    },
    cancel() {
      if (this.transaction.date) return;

      this.state = 'canceled';
      this.transactionToSend = this.transaction.clone();
      this.transactionToSend.value = '0';
      this.transactionToSend.to = this.address;
      this.transactionToSend.gasPrice = this.transactionToSend.getUpGasPrice();
      this.requestPassword();
    },
    parseData() {
      let dataString = this.transaction.data || '0x';
      return web3.utils.hexToString(dataString);
    },
  },
  filters: {
    truncateHash(value) {
      if (!value) return '';
      value = value.toString();
      return `${value.substr(0, 4)}...${value.substr(value.length - 8)}`;
    },
  },
  components: {
    Account,
    ResendModal,
    PasswordModal,
  },
};
</script>

<style lang="scss">
.transaction {
  margin-bottom: 2rem;
  .card {
    border-top: 5px solid $white;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  &.is-danger .card {
    border-top-color: $danger;
    .status-text {
      color: $danger;
    }
  }
  &.is-warning .card {
    border-top-color: $warning;
    .status-text {
      color: $warning;
    }
  }
  &.is-success .card {
    border-top-color: $success;
    .status-text {
      color: $success;
    }
  }
  &.is-received {
    .status-icon svg {
      fill: $success;
    }
    .amount {
      color: $success;
    }
  }
  &.is-sent {
    .status-icon svg {
      fill: $danger;
    }
    .amount {
      color: $danger;
    }
  }

  .card-header {
    flex-direction: column;
    .card-header-link {
      cursor: pointer;
      &:hover {
        background-color: rgba(75, 4, 114, 0.2);
      }
    }
  }

  .text-label {
    color: lighten($dark-grey, 20%);
    margin-right: 0.2em;
  }

  .card-header-title {
    * {
      margin-left: 0.5rem;
    }
  }
}
</style>
