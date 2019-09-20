<template>
  <div class="new-account-modal">
    <v-modal @close="close">
      <header slot="header">
        {{ headerText }}
      </header>
      <div v-if="!providerAdded">
        <v-form
          :is-form-valid="isFormValid"
          @submit="handleButtonClick"
        >
          <v-input
            id="name"
            v-model="innerProvider.name"
            v-validate="'required'"
            :disabled="isLoading"
            :error="errors.first('name')"
            name="name"
            data-vv-name="name"
            :label="$t('components.customProviderModal.networkName')"
            aria-describedby="name"
            :placeholder="$t('components.customProviderModal.networkName')"
            :data-vv-as="$t('components.customProviderModal.networkName')"
            autofocus
            required
          />

          <v-input
            id="url"
            v-model="innerProvider.url"
            v-validate="
              `required|url:require_protocol:true|not_in:${providersLinks}`
            "
            :disabled="isLoading"
            :error="errors.first('url')"
            data-vv-name="url"
            name="url"
            :label="$t('components.customProviderModal.providerUrl')"
            aria-describedby="url"
            placeholder="$t('components.customProviderModal.providerUrl')"
            data-vv-as="$t('components.customProviderModal.providerUrl')"
            @input="handleInput"
          />

          <v-select
            id="currency"
            v-model="innerProvider.currency"
            v-validate="'required'"
            :error="errors.first('currency')"
            :options="currencies"
            data-vv-name="currency"
            name="currency"
            :label="$t('components.customProviderModal.providerCurrenct')"
            aria-describedby="currency"
            :placeholder="$t('components.customProviderModal.providerCurrenct')"
            :data-vv-as="$t('components.customProviderModal.providerCurrenct')"
            required
          />
        </v-form>
      </div>
      <div v-else>
        <p class="subtitle">
          {{ headerTextAfterAction }}
        </p>

        <div class="message">
          <div class="message-header">
            <p>{{ $t('components.customProviderModal.providerAddress') }}</p>
          </div>
          <div class="message-body">
            <p>{{ innerProvider.name }}</p>
            <p class="code address">
              {{ innerProvider.url }}
            </p>
          </div>
        </div>
      </div>
      <template slot="footer">
        <div class="buttons">
          <v-button
            v-if="!providerAdded"
            :loading="isLoading"
            :disabled="!isFormValid"
            class-name="is-primary is-medium"
            type="button"
            data-test="add-provider-button"
            @click="handleButtonClick"
          >
            {{ buttonText }}
          </v-button>
        </div>
      </template>
    </v-modal>
  </div>
</template>
<script>
import { mapActions, mapGetters } from 'vuex';
import { Network } from '@endpass/class';
import formMixin from '@/mixins/form';

const defaultProvider = {
  name: '',
  url: '',
  currency: 1,
};

export default {
  name: 'CustomProviderModal',
  props: {
    provider: {
      type: Object,
      default: () => defaultProvider,
    },
  },
  data() {
    return {
      providerAdded: false,
      isLoading: false,
      innerProvider: Object.assign({}, this.provider),
      currencies: Network.CURRENCIES.map(currency => ({
        val: currency.id,
        text: currency.name,
      })),
    };
  },
  computed: {
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
      return this.needUpdateProvider
        ? this.$t('components.customProviderModal.updateProvider')
        : this.$t('components.customProviderModal.addNewProvider');
    },
    buttonText() {
      return this.needUpdateProvider
        ? this.$t('components.customProviderModal.updateProvider')
        : this.$t('components.customProviderModal.createNewProvider');
    },
    headerTextAfterAction() {
      return this.needUpdateProvider
        ? this.$t('components.customProviderModal.providerUpdated')
        : this.$t('components.customProviderModal.newProviderAdded');
    },
  },
  methods: {
    ...mapActions('web3', ['addNetwork', 'validateNetwork', 'updateNetwork']),
    async handleButtonClick() {
      // When add - providersLinks includes network => validation error
      this.$validator.pause();
      this.isLoading = true;

      try {
        const [networkType, networkId] = await this.validateNetwork({
          network: this.innerProvider,
        });
        const network = {
          ...this.innerProvider,
          id: networkId,
          networkType,
        };
        let isSuccess;

        if (this.needUpdateProvider) {
          isSuccess = await this.updateNetwork({
            network,
            oldNetwork: this.provider,
          });
        } else {
          isSuccess = await this.addNetwork({ network });
        }

        if (isSuccess) {
          this.providerAdded = true;
        }
      } catch (error) {
        this.errors.add({
          field: 'url',
          msg: this.$t('components.customProviderModal.providerIsInvalid'),
          id: 'wrongUrl',
        });
      } finally {
        this.$validator.resume();
        this.isLoading = false;
      }
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
  mixins: [formMixin],
};
</script>
<style lang="css"></style>
