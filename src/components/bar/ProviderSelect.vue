<template>
  <div class="provider-select">
      <div class="net-select">
        <multiselect
           v-model="selectedNet" :options="networks"
           track-by="id" label="name"
                         :show-labels="false"
                         :allow-empty="false"
                         />
      </div>
      <a class="button is-small is-white" @click="openCustomProviderModal()">
        <span class="icon is-small"> +
        </span>
      </a>
    <custom-provider-modal @close="closeCustomProviderModal"
              v-if="customProviderModalOpen"/>
  </div>
</template>

<script>
import Multiselect from 'vue-multiselect'
import { mapActions } from 'vuex';
import CustomProviderModal from '@/components/bar/CustomProviderModal.vue'
import net from '@/mixins/net'
import storage from '@/mixins/storage';

export default {
	data() {
    return {
      customProviderModalOpen: false,
    }
  },
  computed: {
    selectedNet: {
      get() {
        return this.$store.state.web3.activeNet;
      },
      set(net) {
        this.changeNetwork(net.id).catch(e => {
          this.$notify({
            title: e.title,
            text: e.text,
            type: 'is-warning',
          });
          console.error(e);
        });
        this.storage.write('net', net.id).catch(e => {
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
    Multiselect,
    CustomProviderModal,
  },
  mixins: [net, storage],
}
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

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>
