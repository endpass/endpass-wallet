<template>
  <div class="nav-sidebar">
    <div class="navbar-brand">
      <a class="navbar-burger" @click="toggleNavMenu" :class="{'is-active':navMenuActive}">
        <span></span>
        <span></span>
        <span></span>
      </a>
      <router-link class="logo-icon" to="/" exact>
        <img src="@/img/logo-light.png" alt="Endpass Wallet">
      </router-link>
    </div>
    <div class="menu navbar-menu" :class="{'is-active':navMenuActive}" @click.native="closeNavMenu">
      <div class="menu-inner">
        <ul class="menu-list">
          <li>
            <router-link active-class="is-active" class="nav-link" @click.native="closeNavMenu" to="/"
                                                                                                exact>
              <span class="icon is-small"
                    v-html="require('@/img/home.svg')"></span>Home
            </router-link>
          </li>
          <li>
            <router-link v-if="address" active-class="is-active" class="nav-link" :to="{name: 'HistoryPage'}" @click.native="closeNavMenu">
              <span class="icon is-small"
                    v-html="require('@/img/clock.svg')"></span>History
            </router-link>
          </li>
          <li>
            <router-link v-if="wallet" class="nav-link" active-class="is-active" :to="{name: 'SendPage'}" @click.native="closeNavMenu">
              <span class="icon is-small"
                    v-html="require('@/img/arrow-thick-left.svg')"></span>Send
            </router-link>
          </li>
          <li>
            <router-link v-if="address" class="nav-link" active-class="is-active" :to="{name:
            'ReceivePage'}" @click.native="closeNavMenu">
              <span class="icon is-small"
                    v-html="require('@/img/arrow-thick-right.svg')"></span>Receive
            </router-link>
          </li>
          <li>
            <router-link v-if="address" class="nav-link" active-class="is-active" :to="{name:
            'TokensPage'}" @click.native="closeNavMenu">
              <span class="icon is-small"
                    v-html="require('@/img/compass.svg')"></span>Tokens
            </router-link>
          </li>
          <li>
            <router-link v-if="address" class="nav-link" active-class="is-active" :to="{name:
            'SettingsPage'}" @click.native="closeNavMenu">
              <span class="icon is-small"
                    v-html="require('@/img/cog.svg')"></span>Settings
            </router-link>
          </li>
        </ul>

        <p class="menu-label" v-if="wallet">Tools</p>
        <ul class="menu-list" v-if="wallet">
          <li>
            <router-link class="nav-link" active-class="is-active" :to="{name:'MessagePage'}">
              Message
            </router-link>
          </li>
        </ul>
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
      address: state => state.accounts.address && state.accounts.address.getAddressString(),
      email: state => state.accounts.email,
    }),
    ...mapGetters('accounts', ['isPublicAccount']),
  },
  methods: {
    toggleNavMenu() {
      this.navMenuActive = !this.navMenuActive;
    },
    closeNavMenu() {
      this.navMenuActive = false;
    },
  },
}
</script>

<style lang="scss">
.nav-sidebar {
  background-color: #fff;
  .menu-list {
    width: 100%;
  }
  .menu-label {
    padding: 0 .75em;
  }

  .navbar-burger {
    span {
      height: 3px;
    }
  }
}
</style>
