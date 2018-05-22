<template>
  <div id="app">
    <div class="app-top">

      <app-nav :active-account="!!activeAccount"></app-nav>


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
    <div class="main">
      <router-view/>
    </div>
  </div>
</template>

<script>

import web3 from 'web3';
import AccountChooser from '@/components/AccountChooser.vue'
import AppNav from '@/components/AppNav.vue'
import accounts from '@/mixins/accounts'

export default {
  name: 'App',
  components: {
    AppNav,
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
