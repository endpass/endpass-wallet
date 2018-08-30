<template>
  <div class="new-account-modal">
    <v-modal class="is-dark" @close="close">
      <header slot="header">{{ headerText }}</header>
      <div v-if="!providerAdded">
	      <v-form v-model="isFormValid" @submit="addNewProvider">

          <v-input v-model="innerProvider.name"
                   v-validate="'required'"
                   :disabled="isLoading"
                   name="name"
                   label="Network name"
                   id="name"
                   aria-describedby="name"
                   placeholder="Network name"
                   data-vv-name="Network name"
                   required />

          <v-input v-model="innerProvider.url"
                   v-validate="`required|url:require_protocol:true|not_in:${providersLinks}`"
                   :disabled="isLoading"
                   name="url"
                   label="Provider url"
                   id="url"
                   aria-describedby="url"
                   placeholder="Provider url"
                   data-vv-name="Provider url"
                   @input="handleInput"
          />
    
          <v-select v-model="innerProvider.currency"
                    :options="currencies"
                    v-validate="'required'"
                    name="currency"
                    label="Provider currency"
                    id="currency"
                    aria-describedby="currency"
                    placeholder="Provider currency"
                    data-vv-name="Provider currency"
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
            <p>{{innerProvider.name}}</p>
            <p class="code address">{{innerProvider.url}}</p>
          </div>
        </div>
      </div>
      <template slot="footer">
        <div class="buttons">
          <a v-if="!providerAdded"
             class="button is-primary is-medium"
             :class="{'is-loading' : isLoading }"
             :disabled="!isFormValid"
             type="button"
             @click="handleButtonClick">
            {{ buttonText }}
          </a>
        </div>
      </template>

    </v-modal>
  </div>
</template>
<script>
import { mapActions, mapState, mapGetters } from 'vuex';
import VModal from '@/components/ui/VModal';
import VForm from '@/components/ui/form/VForm';
import VInput from '@/components/ui/form/VInput';
import VSelect from '@/components/ui/form/VSelect';

const defaultProvider = {
  name: '',
  url: '',
  currency: 1,
};

export default {
  name: 'CustomProviderModal',
  data() {
    return {
      providerAdded: false,
      isFormValid: false,
      isLoading: false,
      innerProvider: Object.assign({}, this.provider),
    };
  },
  props: {
    provider: {
      type: Object,
      default: () => defaultProvider,
    },
  },
  computed: {
    ...mapState({
      currencies: state =>
        state.web3.currencies.map(currency => ({
          val: currency.id,
          text: currency.name,
        })),
    }),
    ...mapGetters('web3', ['networks']),
    providersLinks() {
      const networks = this.needUpdateProvider
        ? this.networks.filter(net => net.url !== this.provider.url)
        : this.networks;

      return networks.map(net => net.url).toString();
    },
    needUpdateProvider() {
      return !Object.is(this.$props.provider, defaultProvider);
    },
    headerText() {
      return this.needUpdateProvider ? 'Update Provider' : 'Add New Provider';
    },
    buttonText() {
      return this.needUpdateProvider
        ? 'Update Provider'
        : 'Create New Provider';
    },
  },
  methods: {
    ...mapActions('web3', [
      'addNewProvider',
      'validateNetwork',
      'updateProvider',
    ]),
    handleButtonClick() {
      this.isLoading = true;

      return this.validateNetwork({ network: this.innerProvider })
        .then(([networkType, networkId]) => {
          const action = this.needUpdateProvider
            ? this.updateProvider
            : this.addNewProvider;
          const network = { ...this.innerProvider };

          if (!this.needUpdateProvider) {
            network.id = networkId;
          }

          this.isLoading = false;
          this.providerAdded = true;

          action({ network });
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
