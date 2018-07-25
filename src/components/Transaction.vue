<template lang="html">
  <div class="transaction" :class="statusClass">
    <div class="card">
      <div class="card-header">
          <a @click="toggleExpanded" class="card-header-link level is-mobile">
            <div class="level-item">
            {{transaction.hash | truncateHash}}
            </div>

            <div class="level-item">
              <balance :amount="transaction.value" :currency="symbol"></balance>
            </div>
          </a>

          <div class="level is-mobile">
            <div class="level-item">
              <p class="received" title="Received" v-if="recieve">
                <span class="icon is-medium"
                      v-html="require('@/img/arrow-thick-right.svg')"></span>
              </p>
              <span v-if="recieve" class="heading">Received</span>
              <p class="sent" title="Sent" v-else>
                <span class="icon is-medium"
                      v-html="require('@/img/arrow-thick-left.svg')"></span>
              </p>
              <span v-if="!recieve" class="heading">Sent</span>
            </div>

            <p class="date level-item">{{date.fromNow()}}</p>
          </div>
      </div>
      <div class="card-content" v-if="isExpanded">
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
      <div v-if="transaction.state === 'pending'  && !isPublicAccount" class="card-footer">
        <a class="card-footer-item" @click="resend" :disabled="isSyncing">
          <span class="icon is-medium"
                v-html="require('@/img/loop.svg')"></span>Resend
        </a>
        <a class="card-footer-item has-text-danger" @click="cancel" :disabled="isSyncing"
         type="button" name="button">
          <span class="icon is-medium"
                v-html="require('@/img/ban.svg')"></span>Cancel
        </a>
      </div>
    </div>

    <resend-modal :transaction="transactionToSend" v-if="resendModalOpen" @close="closeResendModal" @confirm="confirmResend"/>
    <password-modal v-if="passwordModalOpen" @close="closePassword" @confirm="confirmPassword"/>
  </div>
</template>

<script>
import Balance from '@/components/Balance';
import web3 from 'web3';
import Tx from 'ethereumjs-tx';
import { Transaction } from '@/class';
import ResendModal from './ResendModal';
import PasswordModal from '@/components/modal/PasswordModal';
import { mapState, mapGetters, mapActions } from 'vuex';
import error from '@/mixins/error';
import moment from 'moment';
window.web3 = web3

export default {
  props: ['transaction'],
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
      return this.transaction.state === 'error'
      || this.state === 'error'
      || this.state === 'canceled';
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
      }
    },
    symbol() {
      return (this.transaction.tokenInfo && this.transaction.tokenInfo.symbol) || 'ETH'
    },
    // Returns date as a moment.js object
    date() {
      return moment(this.transaction.date);
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
    Balance,
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

  .card-header {
    flex-direction: column;
    .card-header-link {
      cursor: pointer;
      &:hover {
        background-color: rgba(75, 4, 114, .2);
      }
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

  .card-header-title {
    * {
      margin-left: 0.5rem;
    }
  }
}
</style>
