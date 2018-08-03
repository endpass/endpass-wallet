<template>
  <div class="nav-sidebar">
    <div class="navbar-brand nav-sidebar-header">
      <a class="navbar-burger" @click="toggleNavMenu" :class="{'is-active':navMenuActive}">
        <span></span>
        <span></span>
        <span></span>
      </a>
      <router-link class="logo logo-icon" to="/" exact>
        <img src="@/img/logo-light.png" alt="Endpass Wallet">
      </router-link>
    </div>


    <div class="nav-sidebar-content navbar-menu" :class="{'is-active':navMenuActive}">
      <div class="nav-sidebar-item" v-if="address">
        <p class="menu-label">Accounts</p>
        <account-chooser :width="4"/>
      </div>
      <div class="nav-sidebar-item">
        <div class="buttons is-centered">
          <router-link v-if="!address" :to="{name: 'NewWallet'}" class="button
          is-primary">Create Wallet</router-link>

          <a class="button" v-if="!email" @click.prevent="isLoginModal = true">
            <span class="icon is-small" v-html="require('@/img/account-login.svg')"/>
            Login
          </a>

        <a class="button"
           v-else
           to=""
           @click.prevent="logout()">
          <span class="icon is-small"
                v-html="require('@/img/account-logout.svg')"></span>Logout
        </a>

        </div>
      </div>

      <div class="nav-sidebar-item menu" @click="closeNavMenu">
        <p class="menu-label" v-if="wallet">Wallet</p>
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


      <div class="nav-sidebar-footer">
      </div>

    </div>

    <login-modal v-if="isLoginModal" @close="toggleLoginModal"/>
  </div>
</template>

<script>
import { mapGetters, mapActions, mapState } from 'vuex';
import AccountChooser from '@/components/bar/AccountChooser.vue';
import LoginModal from '@/components/modal/LoginModal';
import modalMixin from '@/mixins/modal';

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
  components: {
    AccountChooser,
    LoginModal,
  },
  mixins: [modalMixin],
}
</script>

<style lang="scss">
.nav-sidebar {
  height: 100%;
  background-color: $white;
  display: grid;
  grid-template-rows: auto 1fr;

  .nav-sidebar-item.menu {
    width: 100%;
    padding: 0;
    .menu-list {
      width: 100%;
    }
    a.is-active .icon svg {
      fill: $white;
    }
  }

  .nav-sidebar-item {
    display: block;
    padding: .5em .75em;
  }

  .buttons .button {
    margin-right: .5em;
  }

  .menu-label {
    padding: 0 .75em;
  }

  .nav-sidebar-header {
    display: flex;
    align-items: center;
    justify-content: space-around;
    a:last-child {
      margin-right: 1em;
    }
    .logo {
      flex: 1;
    }
  }
  .navbar-burger {
    margin-left: 0;
    margin-right: auto;
    span {
      height: 3px;
    }
  }

  .nav-sidebar-content {
    flex-direction: column;
    align-items: center;
  }

}
</style>
