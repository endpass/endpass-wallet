<template>
  <div class="provider-select">
    <div class="flex">
      <div class="select">
        <select v-model="selectedNet">
          <option v-for="net in networks" :value="net.id" :key="net.id">
          {{net.name}}
          </option>
        </select>
      </div>
      <a class="button is-small is-white" @click="openCustomProviderModal()">
        <span class="icon is-small"> +
        </span>
      </a>
    </div>
    <custom-provider-modal @close="closeCustomProviderModal"
              v-if="customProviderModalOpen"/>
  </div>
</template>

<script>
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
    CustomProviderModal,
  },
  mixins: [net, storage],
}
</script>
