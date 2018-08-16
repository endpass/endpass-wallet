<template>
  <base-page class="settings-page">
    <template slot="title">Settings</template>

    <v-form id="save-settings" class="save-settings" @submit="updateSettings">
      <div class="field">
        <label class="label">Email Address</label>
        <div class="control">
          <input class="input is-static" type="email" :value="email" readonly>
        </div>
        <p class="help">Contact support if you need to change your email
          address.</p>
      </div>
      <v-select v-model="newSettings.fiatCurrency"
                label="Fiat Currency"
                name='fiatCurrency'
                :options="availableCurrencies" />

      <v-button id="save-button"
                className="is-primary is-medium"
                :disabled="!isSettingsChange">Save</v-button>
    </v-form>
    <two-factor-auth-settings/>
  </base-page>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import BasePage from '@/components/pages/Base';
import VForm from '@/components/ui/form/VForm.vue';
import error from '@/mixins/error';
import VSelect from '@/components/ui/form/VSelect.vue';
import VButton from '@/components/ui/form/VButton.vue';
import TwoFactorAuthSettings from '@/components/TwoFactorAuthSettings';

export default {
  name: 'settings-page',
  data: () => ({
    newSettings: {
      fiatCurrency: 'USD',
    },
  }),
  computed: {
    ...mapState('accounts', ['settings', 'availableCurrencies', 'email']),
    isSettingsChange() {
      return JSON.stringify(this.settings) !== JSON.stringify(this.newSettings);
    },
  },
  methods: {
    ...mapActions('accounts', {
      updateSettingsInStore: 'updateSettings',
    }),
    updateSettings() {
      this.updateSettingsInStore(this.newSettings).then(() => {
        this.$notify({
          title: 'Successful',
          text: 'Settings was saved',
          type: 'is-info',
        });
      });
    },
  },
  components: {
    BasePage,
    VForm,
    VSelect,
    VButton,
    TwoFactorAuthSettings,
  },
  mounted() {
    try {
      this.newSettings = JSON.parse(JSON.stringify(this.settings));
    } catch (e) {
      this.emitError(e);
    }
  },
  mixins: [error],
};
</script>

<style lang="scss">
.save-settings .field:last-child {
  margin-bottom: 0.75rem;
}
</style>
