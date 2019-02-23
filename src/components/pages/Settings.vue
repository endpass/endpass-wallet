<template>
  <base-page class="settings-page">
    <template slot="title">
      Settings
    </template>

    <v-form
      id="save-settings"
      class="save-settings"
      @submit="updateSettings"
      :is-form-valid="isFormValid"
    >
      <v-input
        v-if="isDefaultIdentity"
        :value="email"
        name="input-email"
        label="Email Address"
        class-name="is-static"
        type="email"
        help="Contact support if you need to change your email
        address."
        readonly
        data-test="input-email"
      />

      <v-select
        v-model="newSettings.fiatCurrency"
        :options="availableCurrencies"
        label="Fiat Currency"
        name="fiatCurrency"
        data-test="select-fiat"
        @input="updateSettings"
      />
    </v-form>
    <two-factor-auth-settings v-if="isDefaultIdentity" />
    <change-password-settings v-if="isDefaultIdentity" />
    <password-recovery v-if="isDefaultIdentity" />
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

export default {
  name: 'SettingsPage',
  data: () => ({
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
    async updateSettings() {
      await this.updateSettingsInStore({ ...this.newSettings });
      this.$notify({
        title: 'Settings Saved',
        text: 'Your settings have been saved.',
        type: 'is-info',
      });
    },
  },
  mixins: [error, form],
  components: {
    BasePage,
    TwoFactorAuthSettings,
    ChangePasswordSettings,
    PasswordRecovery,
  },
};
</script>

<style lang="scss">
.settings-page .field:last-child {
  margin-bottom: 0.75rem;
}
</style>
