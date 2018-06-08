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
          <div class="level-item">
            <div class="level-control">
              <sync-status/>
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
import { mapActions } from 'vuex';
import AccountChooser from '@/components/bar/AccountChooser.vue'
import CustomProviderModal from '@/components/bar/CustomProviderModal.vue'
import SyncStatus from '@/components/bar/SyncStatus.vue'
import accounts from '@/mixins/accounts'
import storage from '@/mixins/storage';

export default {
  data: () => ({
    customProviderModalOpen: false,
  }),
  computed: {
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
        this.changeNetwork(newValue).catch(e => {
          this.$notify({
            title: e.title,
            text: e.text,
            type: 'is-warning',
          });
          console.error(e);
        });
        this.storage.write('net', newValue).catch(e => {
          this.$notify({
            title: e.title,
            text: e.text,
            type: 'is-warning',
          });
        });
      }
    },
  },
  methods: {
    ...mapActions('web3', ['changeNetwork']),
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
    SyncStatus
  },
  mixins: [accounts, storage],
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
