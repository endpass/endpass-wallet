<template>
  <base-page class="settings-page">
    <template slot="title">Settings</template>

    <v-form
      id="save-settings"
      class="save-settings"
      @submit="updateSettings"
    >
      <v-input
        :value="email"
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
    <two-factor-auth-settings/>
    <change-password-settings/>
  </base-page>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import BasePage from '@/components/pages/Base';
import VForm from '@/components/ui/form/VForm.vue';
import VSelect from '@/components/ui/form/VSelect.vue';
import VInput from '@/components/ui/form/VInput.vue';
import VButton from '@/components/ui/form/VButton.vue';
import TwoFactorAuthSettings from '@/components/TwoFactorAuthSettings';
import ChangePasswordSettings from '@/components/ChangePasswordSettings';
import error from '@/mixins/error';

export default {
  name: 'SettingsPage',
  data: () => ({
    newSettings: {
      fiatCurrency: 'USD',
    },
  }),
  computed: {
    ...mapState('user', ['settings', 'availableCurrencies', 'email']),
    isSettingsChange() {
      return JSON.stringify(this.settings) !== JSON.stringify(this.newSettings);
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
  mounted() {
    try {
      this.newSettings = JSON.parse(JSON.stringify(this.settings));
    } catch (e) {
      this.emitError(e);
    }
  },
  mixins: [error],
  components: {
    BasePage,
    VForm,
    VInput,
    VSelect,
    VButton,
    TwoFactorAuthSettings,
    ChangePasswordSettings,
  },
};
</script>

<style lang="scss">
.settings-page .field:last-child {
  margin-bottom: 0.75rem;
}
</style>
