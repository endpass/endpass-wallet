<template>
  <div class="app-nav navbar">
    <div class="navbar-brand">
    </div>
      <div class="navbar-start">
        <div class="navbar-item">
          <router-link :to="{name: 'NewWallet'}" class="button
          is-primary" v-if="!address">Create Wallet</router-link>
        </div>
        <div class="navbar-item has-dropdown is-hoverable" v-if="wallet">
          <a class="navbar-link">
            <span class="icon is-small" v-html="require('@/img/cog.svg')"></span>Tools
          </a>
          <div class="navbar-dropdown">
            <router-link class="navbar-item" :to="{name:'MessagePage'}" >
              Message
            </router-link>
          </div>
        </div>
      </div>

      <div class="navbar-end">
        <div class="navbar-item">
          <account-chooser v-if="address" :width="4"/>
        </div>
        <router-link class="navbar-item"
                      v-if="!email"
                      :to="{name:'LoginPage'}"
                      >
          <span class="icon is-small"
                v-html="require('@/img/account-login.svg')"></span>Login
        </router-link>
        <a class="navbar-item"
                     v-else
                     to=""
                     @click.prevent="logout()">
          <span class="icon is-small"
                v-html="require('@/img/account-logout.svg')"></span>Logout
        </a>
      </div>
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

  .navbar-burger {
    span {
      height: 3px;
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

  .navbar-item .icon:only-child,
  .navbar-link .icon:only-child {
    margin-left: 0;
    margin-right: 0.25em;
  }
}
</style>
