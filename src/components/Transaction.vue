<template lang="html">
  <div class="transaction" :class="'is-'+transaction.state">
    <div class="card">
      <div class="card-header">
        <p class="card-header-title">
        {{transaction.hash}}
        </p>
        <div class="card-header-icon" :title="transaction.state">
          <span v-if="transaction.state === 'success'"
                class="icon has-text-success is-medium"
                v-html="require('@/img/circle-check.svg')"></span>
          <span v-else-if="transaction.state === 'canceled'"
                class="icon has-text-danger is-medium"
                v-html="require('@/img/ban.svg')"></span>
          <span v-else-if="transaction.state === 'pending'" class="icon is-medium"
                v-html="require('@/img/ellipses.svg')"></span>
          <span v-else-if="transaction.state === 'error'"
                class="icon has-text-danger is-medium"
                v-html="require('@/img/warning.svg')"></span>
        </div>
      </div>
      <div class="card-content">
        <div class="columns">
          <div class="column">
            <span class="heading">{{transaction.state}}</span>
            <p v-if="transaction.date">
              <span class="text-label">Date</span>
              <span class="date">{{transaction.date.toLocaleString()}}</span>
            </p>

            <p v-if="recieve">
              <span class="text-label">From</span>
              <span class="address">{{transaction.from}}</span>
            </p>
            <p v-else>
              <span class="text-label">To</span>
              <span class="address">{{transaction.to}}</span>
            </p>
            <p v-if="transaction.nonce">
              <span class="text-label">Nonce</span>
              <span class="address">{{transaction.nonce}}</span>
            </p>
            <p v-if="transaction.data">
              {{parseData(transaction.data)}}
            </p>
          </div>

          <div class="column is-one-third">
            <p>
              <balance :amount="transaction.value" :currency="(transaction.tokenInfo && transaction.tokenInfo.symbol) || 'ETH'"></balance>
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

export default {
  props: ['transaction'],
  data() {
    return {
      resendModalOpen: false,
      passwordModalOpen: false,
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
