<template>
  <div class="new-account-modal">
    <modal-component @close="close">
      <template slot="header">Add New Provider</template>

      <div v-if="!providerAdded">
	      <v-form v-model="isFormValid">

          <v-input v-model="provider.name"
                   v-validate="'required'"
                   name="name"
                   label="Network name"
                   id="name"
                   describe="name"
                   placeholder="Network name"
                   required />

          <v-input v-model="provider.url"
                   v-validate="`required|url:require_protocol:true|not_in:${providersLinks}`"
                   name="url"
                   label="Provider url"
                   id="url"
                   describe="url"
                   placeholder="Provider url"
                   required />

	      </v-form>
      </div>
      <div v-else>
        <p class="subtitle">New Provider Added</p>

        <div class="message">
          <div class="message-header">
            <p>Provider Address</p>
          </div>
          <div class="message-body">
            <p>{{provider.name}}</p>
            <p class="code address">{{provider.url}}</p>
          </div>
        </div>
      </div>

      <div slot="footer">
        <div v-if="!providerAdded">
          <a class="button is-primary"
             :disabled="!isFormValid"
             @click="addNewProvider">Create New Provider</a>
          <a class="button" @click="close">Cancel</a>
        </div>
        <div v-else>
          <a class="button is-primary" @click="close">Close</a>
        </div>
      </div>

    </modal-component>
  </div>
</template>
<script>
import { mapActions } from 'vuex';
import ModalComponent from '@/components/ui/ModalComponent'
import VForm from '@/components/ui/form/VForm';
import VInput from '@/components/ui/form/VInput';

export default {
	data() {
		return {
      isFormValid: false,
			providerAdded: false,
			provider: {
				name: '',
				url: ''
			}
		}
	},
  computed: {
    providersLinks() {
      let links = this.$store.getters['web3/networks'].map(net => net.url).toString();
      return links
    }
  },
	methods: {
    ...mapActions('web3', {
      addNewProviderToStore: 'addNewProvider',
    }),
		addNewProvider() {
      this.addNewProviderToStore(this.provider).catch(e => {
        this.$notify({
          title: e.title,
          text: e.text,
          type: 'is-warning',
        });
        console.error(e);
      });
      this.providerAdded = true;
		},
    close() {
      this.$emit('close')
    }
	},
  components: {
    ModalComponent,
    VInput,
    VForm,
  }
}
</script>
<style lang="css">
	
</style>