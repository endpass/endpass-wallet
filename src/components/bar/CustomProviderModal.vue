<template>
  <div class="new-account-modal">
    <v-modal @close="close">
      <template slot="header">Add New Provider</template>

      <div v-if="!providerAdded">
	      <v-form>

          <v-input v-model="provider.name"
                   v-validate="'required'"
                   name="name"
                   label="Network name"
                   id="name"
                   aria-describedby="name"
                   placeholder="Network name"
                   required />

          <v-input v-model="provider.url"
                   v-validate="`required|url:require_protocol:true|not_in:${providersLinks}`"
                   name="url"
                   label="Provider url"
                   id="url"
                   aria-describedby="url"
                   placeholder="Provider url"
                   required />

         <v-select v-model="provider.currency"
                  :options="currencys"
                  v-validate="'required'"
                  name="currency"
                  label="Provider currency"
                  id="currency"
                  aria-describedby="currency"
                  placeholder="Provider currency"
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
             :disabled="errors && errors.any()"
             @click="addNewProvider">Create New Provider</a>
          <a class="button" @click="close">Cancel</a>
        </div>
        <div v-else>
          <a class="button is-primary" @click="close">Close</a>
        </div>
      </div>

    </v-modal>
  </div>
</template>
<script>
import { mapActions, mapState } from 'vuex';
import VModal from '@/components/ui/VModal';
import VForm from '@/components/ui/form/VForm';
import VInput from '@/components/ui/form/VInput';
import VSelect from '@/components/ui/form/VSelect';

export default {
  data() {
    return {
      providerAdded: false,
      provider: {
        name: '',
        url: '',
      },
    };
  },
  computed: {
    ...mapState({
      currencys: state => state.web3.currencys.map(currency => {return {val: currency.id, text: currency.name}})
    }),
    providersLinks() {
      return this.$store.getters['web3/networks']
        .map(net => net.url)
        .toString();
    },
  },
  methods: {
    ...mapActions('web3', {
      addNewProviderToStore: 'addNewProvider',
    }),
    addNewProvider() {
      this.$validator.validateAll().then(result => {
        if (result) {
          this.addNewProviderToStore(this.provider);
          this.providerAdded = true;
        }
        this.$notify({
          title: 'Form invalid',
          text: 'Please correct errors.',
          type: 'is-warning',
        });
      });
    },
    close() {
      this.$emit('close');
    },
  },
  components: {
    VModal,
    VInput,
    VSelect,
    VForm,
  },
};
</script>
<style lang="css">

</style>
