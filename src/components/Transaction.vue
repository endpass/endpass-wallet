<template lang="html">
  <div
    :class="statusClass"
    class="transaction"
  >
    <div class="transaction-header">
      <account
        v-if="txAddress"
        :address="txAddress"
        :balance="transaction.value.toString()"
        :currency="symbol"
      >
        <div class="transaction-actions level is-mobile">
          <div class="level-left">
            <div class="level-item">
              <span class="date">{{ transactionDateFromNow }}</span>
            </div>
          </div>
          <div class="level-right">
            <v-spinner
              v-if="isHavePendingRelatedTransaction && isPending"
              :label="pendingActionText"
              class="level-item has-text-info actions-loader"
            />
            <template v-else>
              <a
                v-if="isPending && !isPublicAccount"
                :disabled="isSyncing"
                class="level-item has-text-info"
                title="Resend"
                role="button"
                data-test="transaction-resend-button"
                @click="resend"
              >
                <span
                  class="icon is-small"
                  v-html="require('@/img/loop.svg')"
                />
                <span class="caption is-hidden-mobile">
                  Resend
                </span>
              </a>
              <a
                v-if="isPending && !isPublicAccount"
                :disabled="isSyncing"
                class="level-item has-text-danger"
                title="Cancel"
                role="button"
                data-test="transaction-cancel-button"
                @click="cancel"
              >
                <span
                  class="icon is-small"
                  v-html="require('@/img/ban.svg')"
                />
                <span class="caption is-hidden-mobile">
                  Cancel
                </span>
              </a>
            </template>

            <a
              title="Details"
              class="level-item has-text-info"
              data-test="transaction-details-button"
              @click="toggleExpanded"
            >
              <span
                class="icon is-small"
                v-html="require('@/img/ellipses.svg')"
              />

              <span class="caption is-hidden-mobile">Details</span>
            </a>
          </div>
        </div>
      </account>
    </div>

    <div
      v-if="isExpanded"
      class="transaction-detail"
      data-test="transaction-details"
    >
      <div v-if="transaction.hash.length">
        <span class="text-label">Txid</span>
        <p class="code">
          {{ transaction.hash }}
        </p>
      </div>
      <div>
        <span class="heading status-text">{{ transaction.state }}</span>
      </div>

      <div v-if="transaction.date">
        <span class="text-label">Date</span>
        <p class="date">
          {{ transactionFormatedDate }}
        </p>
      </div>

      <div v-if="recieve">
        <span class="text-label">From</span>
        <p class="code address">
          {{ transaction.from }}
        </p>
      </div>

      <div v-else>
        <span class="text-label">To</span>
        <p class="code address">
          {{ transaction.to }}
        </p>
      </div>

      <div>
        <span class="text-label">Nonce</span>
        <span class="">{{ transaction.nonce }}</span>
      </div>

      <div>
        <span class="text-label">Data</span>
        <p class="code">
          {{ parsedData }}
        </p>
      </div>
    </div>

    <resend-modal
      v-if="resendModalOpen"
      :transaction="transactionToSend"
      @close="closeResendModal"
      @confirm="confirmResend"
    />
    <password-modal
      v-if="passwordModalOpen"
      @close="closePassword"
      @confirm="confirmPassword"
    />
  </div>
</template>

<script>
import get from 'lodash/get';
import Account from '@/components/Account';
import ResendModal from '@/components/modal/ResendModal';
import PasswordModal from '@/components/modal/PasswordModal';
import { mapState, mapGetters, mapActions } from 'vuex';
import { addToDate, formateDate, fromNow } from '@endpass/utils/date';
import { getShortStringWithEllipsis } from '@endpass/utils/strings';
import { Transaction } from '@/class';
import { TRANSACTION_STATUS } from '@/constants';

export default {
  props: {
    transaction: {
      type: Object,
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
      displayDate: this.transaction.date,
      dateTimer: null,
    };
  },
  computed: {
    ...mapState({
      address: state => state.accounts.address,
      isSyncing: state => !!state.connectionStatus.isSyncing,
    }),
    ...mapGetters('accounts', ['isPublicAccount']),
    recieve() {
      return this.transaction.to === this.address;
    },
    isSuccess() {
      return this.transaction.state === TRANSACTION_STATUS.SUCCESS;
    },
    isError() {
      return (
        this.transaction.state === TRANSACTION_STATUS.ERROR ||
        this.state === TRANSACTION_STATUS.ERROR ||
        this.state === TRANSACTION_STATUS.CANCELED
      );
    },
    isPending() {
      return this.transaction.state === TRANSACTION_STATUS.PENDING;
    },
    pendingActionText() {
      let text = '';

      if (this.isHavePendingRelatedTransaction) {
        if (this.state === TRANSACTION_STATUS.CANCELED) {
          text = 'Canceling...';
        } else if (this.state === TRANSACTION_STATUS.RESENT) {
          text = 'Resending...';
        }
      }

      return text;
    },
    isHavePendingRelatedTransaction() {
      return (
        get(this.transactionToSend, 'state') === TRANSACTION_STATUS.PENDING
      );
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
      return Transaction.getTokenSymbol(this.transaction);
    },

    transactionFormatedDate() {
      return formateDate(this.transaction.date);
    },

    transactionDateFromNow() {
      return fromNow(this.displayDate);
    },

    txAddress() {
      if (this.recieve) {
        return this.transaction.from;
      }
      return this.transaction.to;
    },

    parsedData() {
      const dataString = this.transaction.data || '0x';
      return dataString;
    },
  },

  methods: {
    ...mapActions('transactions', ['resendTransaction', 'cancelTransaction']),
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
        this.state === TRANSACTION_STATUS.CANCELED
          ? this.cancelTransaction
          : this.resendTransaction;

      this.transactionToSend = Transaction.applyProps(this.transactionToSend, {
        state: TRANSACTION_STATUS.PENDING,
      });

      sendTransaction({ transaction: this.transactionToSend, password })
        .then(() => {
          this.$notify({
            title: 'Successful',
            text: `Transaction was ${this.state}`,
            type: 'is-info',
          });
          this.transactionToSend = null;
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
    resend() {
      this.transactionToSend = Transaction.applyProps(this.transaction, {
        state: null,
      });
      this.resendModalOpen = true;
      this.state = TRANSACTION_STATUS.RESENT;
    },
    cancel() {
      if (this.transaction.state !== TRANSACTION_STATUS.PENDING) return;

      this.state = TRANSACTION_STATUS.CANCELED;
      this.transactionToSend = Transaction.applyProps(this.transaction, {
        value: '0',
        to: this.address,
        gasPrice: Transaction.getUpGasPrice(this.transaction),
        state: null,
      });
      this.requestPassword();
    },
    incrementDisplayDate() {
      const newDate = addToDate(this.transaction.date, 10);
      this.displayDate = newDate;
    },
  },

  created() {
    this.dateTimer = setInterval(this.incrementDisplayDate, 10000);
  },

  beforeDestroy() {
    clearInterval(this.dateTimer);
    this.dateTimer = null;
  },

  components: {
    Account,
    ResendModal,
    PasswordModal,
  },
  filters: {
    truncateHash(value) {
      if (!value) return '';

      return getShortStringWithEllipsis(value.toString());
    },
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
    .balance::before {
      content: '+';
      color: $success;
    }
    .status-icon svg {
      fill: $success;
    }
    .amount {
      color: $success;
    }
  }
  &.is-sent {
    .balance::before {
      content: '-';
      color: $danger;
    }
    .status-icon svg {
      fill: $danger;
    }
    .amount {
      color: $danger;
    }
  }

  .account {
    .media-right {
      margin-left: 0;
    }
    .balance {
      line-height: normal;
    }
    .amount {
      font-size: 1.2em;
    }
    .currency {
      font-size: 0.8em;
    }
  }

  .date {
    color: $dark-grey;
    font-size: 0.9em;
    font-style: italic;
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

  .actions-loader .sl-spinner {
    width: 16px !important;
    height: 16px !important;
  }
}
</style>
