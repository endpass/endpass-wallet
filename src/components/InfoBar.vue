<template>
  <div class="section info-bar"
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
</template>

<script>
import AccountChooser from '@/components/AccountChooser.vue'
import accounts from '@/mixins/accounts'

export default {
  data () {
    return {
      selectedNet: null,
      balanceSubscribtionInstance: null,
    }
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
    let cachedNet = localStorage.getItem('net');
    if(!cachedNet) {
      cachedNet = 'Main';
    }
    this.selectedNet = cachedNet
    this.$store.dispatch('web3/changeNetwork', this.selectedNet);
  },
  components: {
    AccountChooser
  },
  mixins: [accounts]
}
</script>

<style lang="scss">
.info-bar {
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
</style>
