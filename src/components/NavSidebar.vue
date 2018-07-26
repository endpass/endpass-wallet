<template>
  <div class="nav-sidebar">
    <div class="nav-sidebar-header">
      <a class="navbar-burger" @click="toggleNavMenu" :class="{'is-active':navMenuActive}">
        <span></span>
        <span></span>
        <span></span>
      </a>
      <router-link class="logo logo-icon" to="/" exact>
        <img src="@/img/logo-light.png" alt="Endpass Wallet">
      </router-link>
    </div>

    <div class="menu nav-sidebar-content navbar-menu" :class="{'is-active':navMenuActive}" @click="closeNavMenu">
      <div class="menu-inner">
        <ul class="menu-list">
          <li>
            <router-link active-class="is-active" class="nav-link" to="/" exact>
              <span class="icon is-small"
                    v-html="require('@/img/home.svg')"></span>Home
            </router-link>
          </li>
          <li>
            <router-link v-if="address" active-class="is-active" class="nav-link" :to="{name: 'HistoryPage'}">
              <span class="icon is-small"
                    v-html="require('@/img/clock.svg')"></span>History
            </router-link>
          </li>
          <li>
            <router-link v-if="wallet" class="nav-link" active-class="is-active" :to="{name: 'SendPage'}">
              <span class="icon is-small"
                    v-html="require('@/img/arrow-thick-left.svg')"></span>Send
            </router-link>
          </li>
          <li>
            <router-link v-if="address" class="nav-link" active-class="is-active" :to="{name:
            'ReceivePage'}">
              <span class="icon is-small"
                    v-html="require('@/img/arrow-thick-right.svg')"></span>Receive
            </router-link>
          </li>
          <li>
            <router-link v-if="address" class="nav-link" active-class="is-active" :to="{name:
            'TokensPage'}">
              <span class="icon is-small"
                    v-html="require('@/img/compass.svg')"></span>Tokens
            </router-link>
          </li>
          <li>
            <router-link v-if="address" class="nav-link" active-class="is-active" :to="{name:
            'SettingsPage'}">
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

    <div class="nav-sidebar-footer">
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
  height: 100%;
  background-color: $white;
  display: grid;

  .menu-inner, .menu-list {
    width: 100%;
  }
  .menu-label {
    padding: 0 .75em;
  }

  .nav-sidebar-header {
    display: flex;
    .navbar-burger {
      margin-left: 0;
      margin-right: auto;
      span {
        height: 3px;
      }
    }
    .logo {
      flex: 1;
    }
  }

}
</style>
