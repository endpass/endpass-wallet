<template>
  <div class="new-account-modal">
    <v-modal class="is-dark" @close="close">
      <template slot="header">Add New Provider</template>

      <div v-if="!providerAdded">
	      <v-form>

          <v-input v-model="provider.name"
                   v-validate="'required'"
                   :disabled="isLoading"
                   name="name"
                   label="Network name"
                   id="name"
                   aria-describedby="name"
                   placeholder="Network name"
                   required />

          <v-input v-model="provider.url"
                   v-validate="`required|url:require_protocol:true|not_in:${providersLinks}`"
                   :disabled="isLoading"
                   name="url"
                   label="Provider url"
                   id="url"
                   aria-describedby="url"
                   placeholder="Provider url"
                   @input="handleInput"
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
      <template slot="footer">
        <div class="buttons">
          <a v-if="!providerAdded"
             class="button is-primary is-medium"
             :class="{'is-loading' : isLoading }"
             :disabled="!isFormValid"
             @click="addNewProvider">Create New Provider</a>
        </div>
      </template>

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
      isLoading: false,
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
      validateNetwork: 'validateNetwork',
    }),
    addNewProvider() {
      this.isLoading = true;

      this.validateNetwork(this.provider)
        .then(() => {
          this.isLoading = false;
          this.addNewProviderToStore(this.provider);
          this.providerAdded = true;
        })
        .catch(() => {
          this.isLoading = false;
          this.errors.add({
            field: 'url',
            msg: 'Provider is invalid',
            id: 'wrongUrl',
          });
        });
    },
    close() {
      if (!this.isLoading) {
        this.$emit('close');
      }
    },
    handleInput() {
      this.errors.removeById('wrongUrl');
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
