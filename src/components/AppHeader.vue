<template>
  <div class="app-header-inner">
        <div class="nav-item" v-if="!address">
          <router-link :to="{name: 'NewWallet'}" class="button
          is-primary">Create Wallet</router-link>
        </div>

        <div class="nav-item">
          <account-chooser v-if="address" :width="4"/>
        </div>
        <router-link class="nav-item button"
                      v-if="!email"
                      :to="{name:'LoginPage'}"
                      >
          <span class="icon is-small"
                v-html="require('@/img/account-login.svg')"></span>Login
        </router-link>
        <a class="nav-item button"
                     v-else
                     to=""
                     @click.prevent="logout()">
          <span class="icon is-small"
                v-html="require('@/img/account-logout.svg')"></span>Logout
        </a>
  </div>
</template>

<script>
import { mapGetters, mapActions, mapState } from 'vuex';
import AccountChooser from '@/components/bar/AccountChooser.vue';

export default {
  data() {
    return {
    };
  },
  computed: {
    ...mapState({
      wallet: state => state.accounts.wallet,
      address: state => state.accounts.address && state.accounts.address.getAddressString(),
      email: state => state.accounts.email,
    }),
    ...mapGetters('accounts', ['isPublicAccount']),
  },
  methods: {
    ...mapActions('accounts', ['logout']),
  },
  components: {
    AccountChooser,
  },
};
</script>

<style lang="scss">

.app-header-inner {
    display:grid;
    grid-template-columns: 3fr 1fr;
    grid-gap: 1rem;
}

// Navbar
.app-nav {
  .navbar-menu {
    a.navbar-item,
    a.navbar-link {
      font-family: $heading-font-family;
      font-size: 1.1rem;
      text-transform: uppercase;
    }
  }

  a.navbar-item.is-active,
  a.navbar-item:hover,
  a.navbar-link.is-active,
  a.navbar-link:hover,
  .router-link-exact-active {
    background-color: initial;
    color: $purple;

    .icon svg {
      fill: $purple;
    }
  }

  .navbar-end {
    margin-right: 2rem;
  }

  .navbar-item .icon:only-child,
  .navbar-link .icon:only-child {
    margin-left: 0;
    margin-right: 0.25em;
  }
}
</style>
