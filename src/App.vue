<template>
  <div id="app">
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
        </div>

        <div class="navbar-end">
          <div class="navbar-item">
            <div class="navbar-control">
              <span  v-if="activeAccount">
                <p class="heading">Current Account </p>
                <account-chooser/>
                <span v-if="balance !== null"><strong>{{ balance }}</strong> ETH</span>
              </span>
              <router-link :to="{name: 'NewWallet'}" class="button
                is-primary" v-else>Create Wallet</router-link>
            </div>
          </div>
          <div class="navbar-item">
            <div class="navbar-control">
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
    activeAccount() {
      return this.$store.state.accounts.activeAccount;
    },
    networks() {
      return this.$store.state.web3.networks;
    },
    activeNet() {
      return this.$store.state.web3.activeNet;
    },
    balance() {
      return this.$store.state.accounts.balance === null ? null : web3.utils.fromWei(this.$store.state.accounts.balance);
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
  }
}
</script>

<style lang="scss">
// Layout
.container.is-narrow {
  max-width: 600px;
}

// Buttons and Links

a {
  color: $purple;
  &:hover {
    color: darken($purple, 15%);
  }
}

.button {

  &.is-primary {
    background-color: $purple;

    &.is-hovered, &:hover {
      background-color: lighten($purple, 5%);
    }
    &.is-active, &:active {
      background-color: $purple;
    }
    &[disabled] {
      background-color: $purple;
    }
  }
}

// Headers
h1,h2,h3,h4,h5,h6 {
    font-family: $heading-font-family;
}

.title {
  font-weight: 300;
  font-size: 2.6rem;
  color: $dark-grey;
}

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

// Icons

.logo-icon {
  padding-top: 0;
  padding-bottom: 0;
  flex: 1 0 auto;
  img {
    max-height: 3.25rem;
    width: auto;
    margin: auto;
  }
}

.icon {
  svg {
    width: 100%;
    height: auto;
  }
  margin-right: 0.2em;
  &.has-text-danger svg {
      fill: hsl(348, 100%, 61%);
  }
  &.has-text-warning svg {
      fill: hsl(48, 100%, 67%);
  }
  &.has-text-success svg {
      fill: hsl(141, 71%, 48%);
  }
}

.control.has-icons-left,
.control.has-icons-right {
  .icon svg {
    fill: #dbdbdb;
    display: inline-block;
    width: 1em;
  }

  .input:focus, &.select:focus {
    &~.icon svg {
      fill: $dark-grey;
    }
  }

  a.icon {
      svg {
        fill: $dark-grey;
      }
    &:hover {
      svg {
        fill: $primary;
      }
    }
  }
}

// Buttons

.button {
  .icon {
    margin-left: 0;
    margin-right: 0.2em;
    svg {
      display: inline-block;
    }
    &.is-small svg {
      height: 1em;
      width: 1em;
    }
  }

  &.is-primary,
  &.is-link,
  &.is-info,
  &.is-success,
  &.is-warning,
  &.is-danger {
    .icon svg {
      fill: $white;
    }
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

// Transitions
%transition {
  transition: all 0.5s ease-in-out;
}

.fade-enter-active, .fade-leave-active {
  @extend %transition;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}

// Global styles
.bold {
  font-weight: 700;
  font-size: 1.1em;
}

.code {
  background: $light-grey;
  color: $dark-grey;
  padding: 1em;
  word-wrap: break-word;
  font-family: "Lucida Console","Courier New",monospace;
}

</style>
