<template>
  <div class="provider-select">
    <div class="net-select">
      <vue-multiselect
        :allow-empty="false"
        :options="networkOptions"
        :show-labels="false"
        :value="activeNet"
        track-by="id"
        label="name"
        placeholder="Select network"
        @select="selectNet"
      >
        <template slot="option" slot-scope="props">
          <div class="multiselect-option">
            {{ props.option.name }}
            <span class="right" v-if="isCustomNetwork(props.option)">
              <span
                class="icon is-small"
                v-html="require('@/img/pencil.svg')"
                @click.stop="handleEditProvider(props.option)"
              />
              <span
                class="icon is-small"
                v-html="require('@/img/x.svg')"
                @click.stop="handleDeleteProvider(props.option)"
              />
            </span>
          </div>
        </template>
      </vue-multiselect>
    </div>
    <custom-provider-modal
      v-if="customProviderModalOpen"
      @close="closeCustomProviderModal"
      :provider="selectedProvider"
    />
  </div>
</template>

<script>
import VueMultiselect from 'vue-multiselect';
import { mapActions, mapGetters, mapState } from 'vuex';
import CustomProviderModal from '@/components/bar/CustomProviderModal.vue';

export default {
  name: 'ProviderSelect',
  data() {
    return {
      customProviderModalOpen: false,
      selectedProvider: null,
    };
  },
  computed: {
    ...mapState('web3', ['activeNet']),
    ...mapGetters('web3', ['networks', 'isCustomNetwork']),
    networkOptions() {
      // Options that dispatch methods
      const actions = [{ id: -1, name: 'Add Custom Network' }];
      return this.networks.concat(actions);
    },
  },
  methods: {
    ...mapActions('web3', ['changeNetwork', 'deleteProvider']),
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
    openCustomProviderModal(network) {
      this.selectedProvider = network;
      this.customProviderModalOpen = true;
    },
    closeCustomProviderModal() {
      this.customProviderModalOpen = false;
    },
    handleEditProvider(network) {
      this.openCustomProviderModal(network);
    },
    handleDeleteProvider(network) {
      this.deleteProvider({ network });
    },
  },
  components: {
    VueMultiselect,
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
.multiselect-option {
  .right {
    float: right;
  }
}
</style>

<style src="vue-multiselect/dist/vue-multiselect.min.css">
</style>
