<template>
  <div class="provider-select">
    <div class="net-select">
      <multiselect
         :options="networkOptions"
         track-by="id" label="name"
                       :show-labels="false"
                       :allow-empty="false"
                       :value="activeNet"
                       @select="selectNet"
                       placeholder="Select network"
                       />
    </div>
    <custom-provider-modal @close="closeCustomProviderModal"
              v-if="customProviderModalOpen"/>
  </div>
</template>

<script>
import Multiselect from 'vue-multiselect';
import { mapActions } from 'vuex';
import CustomProviderModal from '@/components/bar/CustomProviderModal.vue';
import net from '@/mixins/net';
import storage from '@/mixins/storage';

export default {
  data() {
    return {
      customProviderModalOpen: false,
    };
  },
  computed: {
    networkOptions() {
      // Options that dispatch methods
      let actions = [{ id: -1, name: 'Add Custom Network' }];
      return this.networks.concat(actions);
    },
  },
  methods: {
    ...mapActions('web3', ['changeNetwork']),
    // Triggers when a network is selected
    selectNet(net) {
      if (net.id === -1) {
        this.openCustomProviderModal();
      } else {
        this.setNetwork(net.id);
      }
    },
    setNetwork(id) {
      this.changeNetwork(id);
    },
    openCustomProviderModal() {
      this.customProviderModalOpen = true;
    },
    closeCustomProviderModal() {
      this.customProviderModalOpen = false;
    },
  },
  components: {
    Multiselect,
    CustomProviderModal,
  },
  mixins: [net, storage],
};
</script>


<style lang="scss">
.provider-select {
  .net-select {
    display: inline-block;
    max-width: 100%;
    position: relative;
    vertical-align: top;
  }
}
</style>

<style src="vue-multiselect/dist/vue-multiselect.min.css">
</style>
