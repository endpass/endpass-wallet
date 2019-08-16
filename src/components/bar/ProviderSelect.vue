<template>
  <div class="provider-select">
    <div class="net-select">
      <vue-multiselect
        :allow-empty="false"
        :options="networkOptions"
        :show-labels="false"
        :value="activeNet"
        track-by="url"
        label="name"
        :placeholder="$t('components.providerSelect.selectNetwork')"
        @select="selectNet"
      >
        <template
          slot="option"
          slot-scope="props"
        >
          <div class="multiselect-option">
            {{ props.option.name }}
            <span
              v-if="isCustomNetwork(props.option)"
              class="right"
            >
              <span
                class="icon is-small"
                @click.stop="openCustomProviderModal(props.option)"
                v-html="require('@/img/pencil.svg')"
              />
              <span
                class="icon is-small"
                @click.stop="deleteNetwork({ network: props.option })"
                v-html="require('@/img/x.svg')"
              />
            </span>
          </div>
        </template>
      </vue-multiselect>
    </div>
    <custom-provider-modal
      v-if="customProviderModalOpen"
      :provider="selectedProvider"
      @close="closeCustomProviderModal"
    />
  </div>
</template>

<script>
import VueMultiselect from 'vue-multiselect';
import { mapActions, mapGetters, mapState } from 'vuex';
import CustomProviderModal from '@/components/bar/CustomProviderModal';

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
      const actions = [{ name: this.$t('components.providerSelect.addCustomNetwork')}];
      return this.networks.concat(actions);
    },
  },
  methods: {
    ...mapActions('web3', ['changeNetwork', 'deleteNetwork']),
    selectNet(net) {
      if (net.url) {
        this.changeNetwork({ networkUrl: net.url });
      } else {
        this.openCustomProviderModal();
      }
    },
    openCustomProviderModal(network) {
      this.selectedProvider = network;
      this.customProviderModalOpen = true;
    },
    closeCustomProviderModal() {
      this.customProviderModalOpen = false;
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

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>
