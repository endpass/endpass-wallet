<template>
  <div class="section info-bar"
       :class="{mainnet: isMainNet, testnet: !isMainNet}">
    <div class="container">
      <div class="level">
        <div class="level-left">
          <div class="level-item">
            <div class="level-control">
              <p class="heading">Current Network</p>
              <div class="flex">
                <div class="select">
                  <select v-model="selectedNet">
                    <option v-for="net in networks" :value="net.id">
                    {{net.name}}
                    </option>
                  </select>
                </div>    
                <a class="button is-small is-white" @click="openCustomProviderModal()">
                  <span class="icon is-small"> +
                  </span>
                </a>
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
    <custom-provider-modal @close="closeCustomProviderModal"
      v-if="customProviderModalOpen"/>
  </div>
</template>

<script>
import AccountChooser from '@/components/AccountChooser.vue';
import CustomProviderModal from '@/components/CustomProviderModal.vue';
import accounts from '@/mixins/accounts';
import { saveToStorage } from '@/services/storage';

export default {
  data: () => ({
    balanceSubscribtionInstance: null,
    customProviderModalOpen: false,
  }),
  computed: {
    balanceSubscribtion() {
      let provider = this.$store.state.web3.web3.currentProvider;
      if (this.balanceSubscribtionInstance) {
        this.balanceSubscribtionInstance.stop();
      }
      this.balanceSubscribtionInstance = new EthBlockTracker({ provider });
      this.balanceSubscribtionInstance.on('latest', () => {
        this.updateBalance();
      });
      this.balanceSubscribtionInstance.start();
    },
    networks() {
      return this.$store.getters['web3/networks'];
    },
    activeNet() {
      return this.$store.state.web3.activeNet;
    },
    isMainNet() {
      return this.activeNet.id === 1;
    },
    selectedNet: {
      get() {
        return this.$store.state.web3.activeNet.id;
      },
      set(newValue) {
        this.$store.dispatch('web3/changeNetwork', newValue);
        saveToStorage('net', newValue).catch(() => {
          this.$notify({
            title: 'Sorry',
            text: 'Can`t save data for you',
            type: 'warn',
          });
        });
      },
    },
  },
  methods: {
    openCustomProviderModal() {
      this.customProviderModalOpen = true;
    },
    closeCustomProviderModal() {
      this.customProviderModalOpen = false;
    },
  },
  components: {
    AccountChooser,
    CustomProviderModal,
  },
  mixins: [accounts],
};
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
