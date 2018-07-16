<template>
  <div class="app-nav navbar">
    <div class="navbar-brand">
      <router-link class="navbar-item logo-icon" to="/">
        <img src="@/img/logo-light.png" alt="Endpass Wallet">
      </router-link>
      <a class="navbar-burger" @click="toggleNavMenu" :class="{'is-active':navMenuActive}">
        <span></span>
        <span></span>
        <span></span>
      </a>
    </div>
    <div class="navbar-menu" :class="{'is-active':navMenuActive}">
      <div class="navbar-start">
        <router-link class="navbar-item" to="/" @click.native="toggleNavMenu">
          <span class="icon is-small"
                v-html="require('@/img/home.svg')"></span>Dashboard
        </router-link>
        <router-link v-if="wallet" class="navbar-item" :to="{name: 'HistoryPage'}" @click.native="toggleNavMenu">
          <span class="icon is-small"
                v-html="require('@/img/clock.svg')"></span>History
        </router-link>
        <router-link v-if="wallet && !isPublicAccount" class="navbar-item" :to="{name: 'SendPage'}" @click.native="toggleNavMenu">
          <span class="icon is-small"
                v-html="require('@/img/arrow-thick-left.svg')"></span>Send
        </router-link>
        <router-link v-if="wallet" class="navbar-item" :to="{name:
        'ReceivePage'}" @click.native="toggleNavMenu">
          <span class="icon is-small"
                v-html="require('@/img/arrow-thick-right.svg')"></span>Receive
        </router-link>
        <router-link v-if="wallet" class="navbar-item" :to="{name:
        'TokensPage'}" @click.native="toggleNavMenu">
          <span class="icon is-small"
                v-html="require('@/img/compass.svg')"></span>Tokens
        </router-link>
        <router-link v-if="wallet" class="navbar-item" :to="{name:
        'SettingsPage'}" @click.native="toggleNavMenu">
          <span class="icon is-small"
                v-html="require('@/img/cog.svg')"></span>Settings
        </router-link>
        <div class="navbar-item has-dropdown is-hoverable" v-if="wallet">
          <a class="navbar-link">
            <span class="icon is-small" v-html="require('@/img/cog.svg')"></span>Tools
          </a>
          <div class="navbar-dropdown">
            <router-link class="navbar-item" :to="{name:'MessagePage'}" @click.native="toggleNavMenu">
              Message
            </router-link>
          </div>
        </div>
        <router-link class="navbar-item"
                      v-if="!email"
                      :to="{name:'LoginPage'}"
                      @click.native="toggleNavMenu">
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
  </div>
</template>

<script>
import { mapGetters, mapActions, mapState } from 'vuex';

export default {
  data() {
    return {
      navMenuActive: false,
    };
  },
  computed: {
    ...mapState({
      wallet: state => state.accounts.wallet,
      email: state => state.accounts.email,
    }),
    ...mapGetters('accounts', ['isPublicAccount']),
  },
  methods: {
    ...mapActions('accounts', ['logout']),
    toggleNavMenu() {
      this.navMenuActive = !this.navMenuActive;
    },
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
