<template>
  <div id="app">
    <div class="navbar">
      <div class="navbar-brand">
        <router-link class="navbar-item logo-icon" to="/">
          <img src="@/img/logo-icon-dark.png" alt="Endpass Wallet">
        </router-link>
      </div>
      <div class="navbar-menu">
        <div class="navbar-start">
          <router-link class="navbar-item" :to="{name: 'HistoryPage'}">History</router-link>
          <router-link class="navbar-item" :to="{name: 'SendPage'}">Send</router-link>
          <router-link class="navbar-item" :to="{name: 'ReceivePage'}">Receive</router-link>
        </div>

        <div class="navbar-end">
          <div class="navbar-item">
            <span>Current Account: </span>
            <span v-if="activeAccount">{{ activeAccount.getAddressString()
              | truncateAddr}}</span>
            <span v-if="balance !== null">{{ balance }} ETH</span>
            <router-link :to="{name: 'NewWallet'}" class="button is-primary" v-else>Create</router-link>
          </div>
          <div class="navbar-item">
            <span>Current Network</span>
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
    <router-view/>
  </div>
</template>

<script>

import web3 from 'web3';

export default {
  name: 'App',
  data () {
    let cachedNet = localStorage.getItem('net');
    if(!cachedNet) {
      cachedNet = 'Main';
    }
    return {
      selectedNet: cachedNet
    };
  },
  computed: {
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
      this.$store.commit('web3/changeNetwork', this.selectedNet);
      localStorage.setItem('net', this.selectedNet);
      this.$store.dispatch('accounts/updateBalance');
      this.$store.dispatch('accounts/subscribeOnBalanceUpdates');
    }
  },
  filters: {
    // Truncate an address to the first 4 and last 4 characters
    truncateAddr(value) {
      if (!value) return ''
      value = value.toString()
    return `${value.substr(0,4)}...${value.substr(value.length-4)}`
    }
  },
  created() {
    this.$store.commit('web3/changeNetwork', this.selectedNet);
  }
}
</script>

<style lang="scss">
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
a.navbar-item.is-active, a.navbar-item:hover, a.navbar-link.is-active,
a.navbar-link:hover, .router-link-exact-active {
  background-color: initial;
  color: $purple;
}

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

</style>
