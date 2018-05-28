<template>
  <div class="new-account-modal">
    <modal-component @close="close">
      <template slot="header">Add New Provider</template>

      <div v-if="!providerAdded">
	      <form>
          <div class="field">
            <label class="label" for="name">Name</label>
            <div class="control">
              <input v-model="provider.name" name="name" v-validate="'required'" type="text" class="input" :class="{'is-danger': fields.name && fields.name.touched && fields.name.invalid }" id="name" aria-describedby="name" placeholder="Receiver address" required>
            </div>
            <p class="help is-danger">{{errors.first('name')}}</p>
          </div>
          <div class="field">
            <label class="label" for="name">Name</label>
            <div class="control">
              <input v-model="provider.address" name="address" v-validate="'required|url'" type="text" class="input" :class="{'is-danger': fields.address && fields.address.touched && fields.address.invalid }" id="name" aria-describedby="address" placeholder="Receiver address" required>
            </div>
            <p class="help is-danger">{{errors.first('name')}}</p>
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
            <p class="code address">{{provider.address}}</p>
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
				address: ''
			}
		}
	},
	methods: {
		addNewProvider() {
      this.$store.dispatch('web3/addNewProvider', this.provider);
		}
	}
}
</script>
<style lang="css">
	
</style>