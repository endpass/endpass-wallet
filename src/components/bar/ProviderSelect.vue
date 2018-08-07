<template>
  <div class="provider-select">
    <div class="net-select">
      <multiselect
        :allow-empty="false"
        :options="networkOptions"
        :show-labels="false"
        :value="activeNet"
        track-by="id" 
        label="name"
        placeholder="Select network"
        @select="selectNet"
      />
    </div>
    <custom-provider-modal
      v-if="customProviderModalOpen"
      @close="closeCustomProviderModal"
    />
  </div>
</template>

<script>
import Multiselect from 'vue-multiselect';
import { mapActions, mapGetters, mapState } from 'vuex';
import CustomProviderModal from '@/components/bar/CustomProviderModal.vue';

export default {
  name: 'ProviderSelect',
  data() {
    return {
      customProviderModalOpen: false,
    };
  },
  computed: {
    ...mapState('web3', ['activeNet']),
    ...mapGetters('web3', ['networks']),
    networkOptions() {
      // Options that dispatch methods
      const actions = [{ id: -1, name: 'Add Custom Network' }];
      return this.networks.concat(actions);
    },
  },
  methods: {
    ...mapActions('web3', ['changeNetwork']),
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
