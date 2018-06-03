<template>
  <div class="new-account-modal">
    <modal-component @close="close">
      <template slot="header">Add New Provider</template>

      <div v-if="!providerAdded">
	      <form>
          <div class="field">
            <label class="label" for="name">Network name</label>
            <div class="control">
              <input v-model="provider.name" name="name" v-validate="'required'" type="text" class="input" :class="{'is-danger': fields.name && fields.name.touched && fields.name.invalid }" id="name" aria-describedby="name" placeholder="Network name" required>
            </div>
            <p class="help is-danger">{{errors.first('name')}}</p>
          </div>
          <div class="field">
            <label class="label" for="name">Provider url</label>
            <div class="control">
              <input v-model="provider.url" name="url" v-validate="'required|url:require_protocol:true|not_in:' + providersLinks" type="text" class="input" :class="{'is-danger': fields.url && fields.url.touched && fields.url.invalid }" id="name" aria-describedby="url" placeholder="Provider url" required>
            </div>
            <p class="help is-danger">{{errors.first('url')}}</p>
          </div>
	      </form>
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
          <a class="button is-primary" @click="addNewProvider">Create
            New Provider</a>
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
import ModalComponent from '@/components/ModalComponent'
export default {
	data() {
		return {
			providerAdded:false,
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
		addNewProvider() {
      this.$store.dispatch('web3/addNewProvider', this.provider);
      this.providerAdded = true;
		},
    close() {
      this.$emit('close')
    }
	},
  components: {
    ModalComponent
  }
}
</script>
<style lang="css">
	
</style>