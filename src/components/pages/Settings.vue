<template>
  <base-page class="settings-page">
    <template slot="title">
      {{ $t('components.settings.header') }}
    </template>

    <v-form
      id="save-settings"
      :is-form-valid="isFormValid"
      class="save-settings"
      @submit="updateSettings"
    >
      <v-input
        v-if="isDefaultIdentity"
        :value="email"
        name="input-email"
        :label="$t('components.settings.emailAddress')"
        class-name="is-static"
        type="email"
        :help="$t('components.settings.emailAddressHelp')"
        readonly
        data-test="input-email"
      />
      <v-select
        v-model="newSettings.fiatCurrency"
        :options="availableCurrencies"
        :label="$t('components.settings.fiatCurrency')"
        name="fiatCurrency"
        data-test="select-fiat"
        @input="updateSettings"
      />
    </v-form>
    <two-factor-auth-settings v-if="isDefaultIdentity" />
    <change-password-settings v-if="isDefaultIdentity" />
    <password-recovery v-if="isDefaultIdentity" />
    <seed-recovery
      :is-locked="isSeedRecoveryLocked"
      @lock="handleSeedRecoveryLock"
    />
    <email-update v-if="isDefaultIdentity" />
  </base-page>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex';
import error from '@/mixins/error';
import form from '@/mixins/form';
import BasePage from '@/components/pages/Base';
import TwoFactorAuthSettings from '@/components/TwoFactorAuthSettings';
import ChangePasswordSettings from '@/components/ChangePasswordSettings';
import PasswordRecovery from '@/components/PasswordRecovery';
import SeedRecovery from '@/components/SeedRecovery';
import EmailUpdate from '@/components/EmailUpdate';

export default {
  name: 'SettingsPage',

  data: () => ({
    isSeedRecoveryLocked: false,
    newSettings: {
      fiatCurrency: 'USD',
    },
  }),

  computed: {
    ...mapState('user', ['settings', 'availableCurrencies', 'email']),
    ...mapGetters('user', ['isDefaultIdentity']),
  },

  watch: {
    settings: {
      handler(settings) {
        try {
          this.newSettings = JSON.parse(JSON.stringify(settings));
        } catch (e) {
          this.emitError(e);
        }
      },
      immediate: true,
      deep: true,
    },
  },

  methods: {
    ...mapActions('user', {
      updateSettingsInStore: 'updateSettings',
    }),
    ...mapActions('accounts', ['recoverSeed', 'backupSeed']),

    async updateSettings() {
      await this.updateSettingsInStore({ ...this.newSettings });
      this.$notify({
        title: this.$t('components.settings.settingsSaved'),
        text: this.$t('components.settings.settingsSavedText'),
        type: 'is-info',
      });
    },

    handleSeedRecoveryLock() {
      this.isSeedRecoveryLocked = true;
    },
  },

  mixins: [error, form],

  components: {
    BasePage,
    TwoFactorAuthSettings,
    ChangePasswordSettings,
    PasswordRecovery,
    SeedRecovery,
    EmailUpdate,
  },
};
</script>

<style lang="scss">
.settings-page .field:last-child {
  margin-bottom: 0.75rem;
}
</style>
