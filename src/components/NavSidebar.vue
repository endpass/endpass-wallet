<template>
  <div class="nav-sidebar">
    <div class="navbar-brand nav-sidebar-header">
      <a
        :class="{ 'is-active': navMenuActive }"
        class="navbar-burger"
        @click="toggleNavMenu"
      >
        <span />
        <span />
        <span />
      </a>
      <router-link
        class="logo logo-icon"
        to="/"
        exact
      >
        <img
          src="@/img/logo-light.png"
          alt="Endpass Wallet"
        >
      </router-link>
      <div class="login-control">
        <a
          v-if="!isLoggedIn"
          class="button is-success"
          data-test="button-login"
          @click.prevent="handleLogin"
        >
          <span
            class="icon is-small"
            v-html="require('@/img/account-login.svg')"
          />
          Login
        </a>
        <a
          v-else
          class="button"
          @click.prevent="handleLogout"
        >
          <span
            class="icon is-small"
            v-html="require('@/img/account-logout.svg')"
          />
          Logout
        </a>
      </div>
    </div>

    <div
      :class="{ 'is-active': navMenuActive }"
      class="nav-sidebar-content navbar-menu"
    >
      <div class="nav-sidebar-item network-options">
        <div class="level is-mobile">
          <div class="level-item">
            <div class="field">
              <p class="heading">Chain</p>
              <div class="control is-expanded">
                <currency-select />
              </div>
            </div>
          </div>
          <div class="level-item">
            <div class="field">
              <p class="heading">Network</p>
              <div class="control is-expanded">
                <provider-select />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        v-if="address"
        class="nav-sidebar-item section"
      >
        <div class="columns is-mobile">
          <div class="column">
            <p class="menu-label">Accounts</p>
          </div>
          <div
            v-if="!isCustomIdentity"
            class="column"
          >
            <a
              class="button is-outlined is-small is-info"
              @click="openNewAccountModal"
            >&#43; Add Account</a>
          </div>
        </div>
        <account-chooser
          v-model="activeAddress"
          :width="4"
          :accounts="walletsOptions"
          :allow-empty="false"
        />
      </div>

      <div
        class="nav-sidebar-item menu"
        data-test="nav-sidebar-menu"
        @click="closeNavMenu"
      >
        <p
          v-if="wallet"
          class="menu-label"
        >Wallet</p>
        <ul class="menu-list">
          <li>
            <router-link
              active-class="is-active"
              class="nav-link"
              to="/"
              exact
            >
              <span
                class="icon is-small"
                v-html="require('@/img/home.svg')"
              />
              Home
            </router-link>
          </li>
          <li>
            <router-link
              v-if="address"
              :to="{ name: 'HistoryPage' }"
              active-class="is-active"
              class="nav-link"
            >
              <span
                class="icon is-small"
                v-html="require('@/img/clock.svg')"
              />
              History
            </router-link>
          </li>
          <li>
            <router-link
              v-if="wallet && !isPublicAccount"
              :to="{ name: 'SendPage' }"
              class="nav-link"
              active-class="is-active"
            >
              <span
                class="icon is-small"
                v-html="require('@/img/arrow-thick-left.svg')"
              />
              Send
            </router-link>
          </li>
          <li>
            <router-link
              v-if="address"
              :to="{ name: 'ReceivePage' }"
              class="nav-link"
              active-class="is-active"
            >
              <span
                class="icon is-small"
                v-html="require('@/img/arrow-thick-right.svg')"
              />
              Receive
            </router-link>
          </li>
          <li>
            <router-link
              v-if="address"
              :to="{ name: 'TokensPage' }"
              class="nav-link"
              active-class="is-active"
            >
              <span
                class="icon is-small"
                v-html="require('@/img/compass.svg')"
              />
              Tokens
            </router-link>
          </li>
          <li>
            <router-link
              v-if="address"
              :to="{ name: 'SettingsPage' }"
              class="nav-link"
              active-class="is-active"
            >
              <span
                class="icon is-small"
                v-html="require('@/img/cog.svg')"
              />
              Settings
            </router-link>
          </li>
        </ul>

        <template v-if="wallet && !isPublicAccount">
          <p class="menu-label">Tools</p>
          <ul class="menu-list">
            <li>
              <a
                :href="dappBrowserUrl"
                class="nav-link"
                target="_blank"
              >Dapp</a>
            </li>
            <li>
              <router-link
                :to="{ name: 'MessagePage' }"
                class="nav-link"
                active-class="is-active"
              >Message</router-link>
            </li>
            <li>
              <router-link
                :to="{ name: 'TransactionPage' }"
                class="nav-link"
                active-class="is-active"
              >Transaction</router-link>
            </li>
          </ul>
        </template>
      </div>

      <div class="nav-sidebar-footer" />
    </div>
    <new-account-modal
      v-if="newAccountModalOpen"
      @close="closeNewAccountModal"
    />

    <confirm-logout-modal
      v-if="isConfirmLogoutModal"
      @confirm="logout"
      @close="toggleConfirmLogoutModal"
    />
  </div>
</template>

<script>
import { mapGetters, mapActions, mapState } from 'vuex';
import ProviderSelect from '@/components/bar/ProviderSelect';
import CurrencySelect from '@/components/bar/CurrencySelect';
import AccountChooser from '@/components/AccountChooser';
import ConfirmLogoutModal from '@/components/modal/ConfirmLogoutModal';
import modalMixin from '@/mixins/modal';
import NewAccountModal from '@/components/modal/NewAccountModal';

export default {
  name: 'NavSidebar',

  data: () => ({
    navMenuActive: false,
    newAccountModalOpen: false,
    dappBrowserUrl: ENV.VUE_APP_DAPP_BROWSER_URL,
  }),

  computed: {
    ...mapState({
      address: state => state.accounts.address,
      hdKey: state => state.accounts.hdKey,
      wallets: state => state.accounts.wallets,
      email: state => state.user.email,
      identityType: state => state.user.identityType,
    }),
    ...mapGetters('user', [
      'isLoggedOut',
      'isLoggedIn',
      'isCustomIdentity',
      'isLocalIdentity',
    ]),
    ...mapGetters('accounts', ['wallet', 'isPublicAccount']),

    walletsOptions() {
      return Object.keys(this.wallets);
    },

    activeAddress: {
      get() {
        return this.address;
      },

      set(newValue) {
        this.selectWallet(newValue);
      },
    },
  },

  methods: {
    ...mapActions('user', ['logout', 'login']),
    ...mapActions('accounts', ['selectWallet']),

    toggleNavMenu() {
      this.navMenuActive = !this.navMenuActive;
    },

    closeNavMenu() {
      this.navMenuActive = false;
    },

    openNewAccountModal() {
      this.newAccountModalOpen = true;
    },

    closeNewAccountModal() {
      this.newAccountModalOpen = false;
    },

    async handleLogin() {
      await this.login();
    },

    handleLogout() {
      if (this.isLocalIdentity) {
        this.toggleConfirmLogoutModal();
      } else {
        this.logout();
      }
    },
  },

  mixins: [modalMixin],

  components: {
    ProviderSelect,
    ConfirmLogoutModal,
    CurrencySelect,
    AccountChooser,
    NewAccountModal,
  },
};
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
      font-family: $heading-font-family;
      font-size: 1.2em;
      width: 100%;

      a.is-active {
        background-color: $purple;
      }
    }
    a.is-active .icon svg {
      fill: $white;
    }
  }

  .nav-sidebar-item {
    display: block;
    padding: 0.5em 0.75em;
  }

  .buttons .button {
    margin-right: 0.5em;
  }

  .menu-label {
    padding: 0 0.75em;
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

  .network-options {
    //background-color: $dark-blue;
    //color: $white;
  }
}
</style>
