<template>
  <div>
    <wallets-list
      v-if="isListVisible"
      v-model="bridgeButtonListIsLoading"
      :type="walletType"
      :is-importing="bridgeButtonListIsImporting"
      :auto-load="true"
      @select="setSelectedAddress"
    >
      <template slot="buttons">
        <wallet-add-button
          v-model="bridgeButtonListIsImporting"
          :type="walletType"
          :selected-address="bridgeButtonListSelectedAddress"
          @success="$router.push('/')"
        >
          {{ $t('global.import') }}
        </wallet-add-button>
      </template>
    </wallets-list>
    <v-form
      v-else
      :is-form-valid="isFormValid"
      data-test="import-seed-form"
      @submit="togglePasswordModal"
    >
      <v-input
        id="hdkeySeed"
        key="hdkeyPhraseUnique"
        v-model="key"
        v-validate="'required|seed_phrase'"
        :error="errors.first('hdkeyPhrase')"
        :label="$t('components.importFromSeed.seedPhrase')"
        name="hdkeyPhrase"
        data-vv-name="hdkeyPhrase"
        :data-vv-as="$t('components.importFromSeed.seedPhrase')"
        aria-describedby="hdkeyPhrase"
        :placeholder="$t('components.importFromSeed.seedPhrase')"
        required
        data-test="input-seed-phrase"
        @input="handleInput"
      />
      <v-button
        :loading="isCreating"
        :disabled="!isFormValid"
        class-name="is-primary is-cta"
        data-test="submit-import"
      >
        {{ $t('global.import') }}
      </v-button>
    </v-form>
    <password-modal
      v-if="isPasswordModal"
      @close="togglePasswordModal"
      @confirm="handlePasswordConfirm"
    />
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import PasswordModal from '@/components/modal/PasswordModal';
import modalMixin from '@/mixins/modal';
import formMixin from '@/mixins/form';
import { Wallet } from '@/class';
import { BridgeButtonListMixin } from '@/components/walletsListFromHd';

/** @type {{HD_PUBLIC,getTypes}} */
const WALLET_TYPES = Wallet.getTypes();

export default {
  name: 'ImportFromSeed',
  data: () => ({
    key: '',
    isCreating: false,
    isListVisible: false,
    isPasswordModal: false,
    walletType: WALLET_TYPES.HD_PUBLIC,
  }),
  methods: {
    ...mapActions('accounts', ['addHdPublicWallet']),
    async handlePasswordConfirm(password) {
      this.isCreating = true;
      this.isPasswordModal = false;

      await new Promise(res => setTimeout(res, 20));

      try {
        await this.addHdPublicWallet({
          key: this.key,
          password,
        });
        this.isListVisible = true;
      } catch (e) {
        this.errors.add({
          field: 'hdkeyPhrase',
          msg: this.$t('components.importFromSeed.seedPhraseInvalid'),
          id: 'wrongPhrase',
        });
      } finally {
        this.isCreating = false;
      }
    },
    handleInput() {
      this.errors.removeById('wrongPhrase');
    },
  },
  mixins: [modalMixin, formMixin, BridgeButtonListMixin],
  components: { PasswordModal },
};
</script>
