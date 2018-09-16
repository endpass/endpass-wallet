<template>
  <div class="quick-actions">
    <div class="navbar is-fixed-bottom">
      <router-link
        active-class="is-active"
        class="navbar-item button"
        to="/"
        exact
      >
        <span
          class="icon is-small"
          v-html="require('@/img/home.svg')"
        />
        <span class="caption">Home</span>
      </router-link>
      <router-link
        :disabled="!wallet"
        :to="{name: 'SendPage'}"
        active-class="is-active"
        class="navbar-item button"
      >
        <span
          class="icon is-small"
          v-html="require('@/img/arrow-thick-left.svg')"
        />
        <span class="caption">Send</span>
      </router-link>
      <router-link
        :disabled="!address"
        :to="{name:
        'ReceivePage'}"
        class="navbar-item button"
        active-class="is-active"
      >
        <span
          class="icon is-small"
          v-html="require('@/img/arrow-thick-right.svg')"
        />
        <span class="caption">Recieve</span>
      </router-link>
      <router-link
        :disabled="!address"
        :to="{name: 'HistoryPage'}"
        class="navbar-item button"
        active-class="is-active"
      >
        <span
          class="icon is-small"
          v-html="require('@/img/clock.svg')"
        />
        <span class="caption">History</span>
      </router-link>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';

export default {
  name: 'quick-actions',
  data() {
    return {};
  },
  computed: {
    ...mapState({
      wallet: state => state.accounts.wallet,
      address: state =>
        state.accounts.address &&
        state.accounts.address.getChecksumAddressString(),
    }),
    ...mapGetters('accounts', ['isPublicAccount']),
  },
};
</script>

<style lang="scss">
.quick-actions {
  //flex: 1;

  .navbar {
    background: $white;
    display: flex;
    justify-content: space-between;
    align-items: stretch;

    .navbar-item {
      span {
        display: block;
        margin: 0 auto;
      }
    }

    .button {
      border: none;
      .icon {
        margin: 0 auto;
      }
    }
  }
}
</style>
