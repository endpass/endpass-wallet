<template>
  <div id="app">
    <div class="app-top">
      <div class="navbar">
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
            <router-link v-if="activeAccount" class="navbar-item" :to="{name: 'HistoryPage'}" @click.native="toggleNavMenu">
              <span class="icon is-small"
                v-html="require('@/img/clock.svg')"></span>History
            </router-link>
            <router-link v-if="activeAccount" class="navbar-item" :to="{name: 'SendPage'}" @click.native="toggleNavMenu">
              <span class="icon is-small"
                v-html="require('@/img/arrow-thick-left.svg')"></span>Send
            </router-link>
            <router-link v-if="activeAccount" class="navbar-item" :to="{name:
              'ReceivePage'}" @click.native="toggleNavMenu">
              <span class="icon is-small"
                v-html="require('@/img/arrow-thick-right.svg')"></span>Receive
            </router-link>
            <router-link v-if="activeAccount" class="navbar-item" :to="{name:
              'TokensPage'}" @click.native="toggleNavMenu">
              <span class="icon is-small"
                v-html="require('@/img/compass.svg')"></span>Tokens
            </router-link>
          </div>

        </div>
      </div>

      <div class="section top-info"
           :class="{mainnet: isMainNet, testnet: !isMainNet}">
        <div class="container">
          <div class="level">
            <div class="level-left">
              <div class="level-item">
                <div class="level-control">
                  <p class="heading">Current Network</p>
                  <div class="select">
                    <select @change="selectNet" v-model="selectedNet">
                      <option v-for="net in networks" :value="net.name">
                      {{net.name}}
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div class="level-right">
              <div class="level-item">
                <div class="level-control">
                  <span  v-if="activeAccount">
                    <p class="heading">Current Account</p>
                    <account-chooser/>
                  </span>
                  <router-link :to="{name: 'NewWallet'}" class="button
                  is-primary" v-else>Create Wallet</router-link>
                </div>
              </div>
              <div class="level-item" v-if="balance !== null">
                <div class="level-stat">
                  <p class="heading">Balance</p>
                  <span class="title">{{ balance }}</span> ETH
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>

     <!-- <flash-message inline-template>
       <div class="notifications is-overlay">
         <transition-group name="fade" tag="div" class="container">
           <div v-for="(message, index) in storage" :key="index"
                class="notification" :class="'is-' + message.type" >
                <button class="delete"
                        @click.stop.prevent="destroyFlash(index)"></button>
                {{ message.content }}
           </div>
         </transition-group>
       </div>
     </flash-message> -->
    <div class="main" @click="navMenuActive=false">
      <router-view/>
    </div>
  </div>
</template>

<script>

import web3 from 'web3';
import AccountChooser from '@/components/AccountChooser.vue'
import accounts from '@/mixins/accounts'

export default {
  name: 'App',
  components: {
    AccountChooser
  },
  data () {
    let cachedNet = localStorage.getItem('net');
    if(!cachedNet) {
      cachedNet = 'Main';
    }

    return {
      selectedNet: cachedNet,
      balanceSubscribtionInstance: null,
      navMenuActive: false
    };
  },
  computed: {
    balanceSubscribtion() {
      let provider = this.$store.state.web3.web3.currentProvider;
      if(this.balanceSubscribtionInstance) {
        this.balanceSubscribtionInstance.stop();
      }
      this.balanceSubscribtionInstance = new EthBlockTracker({ provider });
      this.balanceSubscribtionInstance.on('latest', () => {
        this.updateBalance();
      });
      this.balanceSubscribtionInstance.start();
    },
    networks() {
      return this.$store.state.web3.networks;
    },
    activeNet() {
      return this.$store.state.web3.activeNet;
    },
    isMainNet() {
      return this.activeNet.name === 'Main'
    }
  },
  methods: {
    selectNet() {
      this.$store.dispatch('web3/changeNetwork', this.selectedNet);
      localStorage.setItem('net', this.selectedNet);
    },
    toggleNavMenu () {
      this.navMenuActive = !this.navMenuActive
    }
  },
  created() {
    this.$store.dispatch('web3/changeNetwork', this.selectedNet);
  },
  mixins: [accounts]
}
</script>

<style lang="scss">
@import './css/buttons.scss';
@import './css/icons.scss';
@import './css/layout.scss';
@import './css/typography.scss';

// Navbar
.navbar-menu {
  a.navbar-item {
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

a.navbar-item.is-active, a.navbar-item:hover, a.navbar-link.is-active,
a.navbar-link:hover, .router-link-exact-active {
  background-color: initial;
  color: $purple;

  .icon svg {
    fill: $purple;
  }
}

.navbar-item .icon:only-child, .navbar-link .icon:only-child {
  margin-left: 0;
  margin-right: 0.25em;
}

.top-info {
  padding: 0.25rem 1rem;
  color: $white;
  &.mainnet {
    background-color: $dark-blue;
  }
  &.testnet {
    background-color: darken($warning, 35%);
  }

  .title {
    color: $white;
  }
}

// Notifications

.notifications {
  z-index: 1000;
}
.notification {
  &.is-error {
    background-color: #ff3860;
    color: #fff;
  }
}

</style>
