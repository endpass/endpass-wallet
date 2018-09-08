<template>
  <v-form @submit="handleFormSubmit">
    <label class="label">Change Password</label>
    <v-password v-model="oldPassword"
                name="oldPassword"
                validator="required|min:8"
                placeholder="Old Password"
                :disabled="isLoading"
    />
    <v-password v-model="newPassword"
                name="newPassword"
                validator="required|min:8"
                placeholder="New Password"
                :disabled="isLoading"
    />
    <v-button className="is-primary is-medium"
              :loading="isLoading">
      Change Password
    </v-button>
  </v-form>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import VForm from '@/components/ui/form/VForm';
import VButton from '@/components/ui/form/VButton';
import VPassword from '@/components/ui/form/VPassword';
import { keystore } from '@/utils';

export default {
  name: 'change-password-settings',
  data: () => ({
    isLoading: false,
    oldPassword: null,
    newPassword: null,
  }),
  computed: {
    ...mapGetters('accounts', [
      'hdWallet',
      'decryptedWallets',
      'encryptedHdWallet',
      'encryptedWallets',
    ]),
  },
  methods: {
    ...mapActions('accounts', ['saveWallet']),
    decryptWallets() {
      let decryptedWallets = [];
      let decryptedHdWallet;

      try {
        decryptedWallets = this.decryptedWallets(this.oldPassword);
        decryptedHdWallet = this.hdWallet(this.oldPassword);
      } catch (error) {
        this.$notify({
          title: 'Error while decrypting wallets',
          text:
            'An error occurred while decrypting wallets. Try using a different password.',
          type: 'is-danger',
        });
      }

      return { decryptedWallets, decryptedHdWallet };
    },
    encryptWallets(decryptedWallets, decryptedHdWallet) {
      let encryptedWallets = [];
      let encryptedHdWallet;

      try {
        encryptedWallets = this.encryptedWallets(
          this.newPassword,
          decryptedWallets,
        );
        encryptedHdWallet = this.encryptedHdWallet(
          this.newPassword,
          decryptedHdWallet,
        );
      } catch (error) {
        this.$notify({
          title: 'Error while encrypting wallets',
          text:
            'An error occurred while encripting wallets. Try using a different password.',
          type: 'is-danger',
        });
      }

      return { encryptedWallets, encryptedHdWallet };
    },
    async handleFormSubmit() {
      const { decryptedWallets, decryptedHdWallet } = this.decryptWallets();

      if (!decryptedWallets.length) {
        return;
      }

      const { encryptedWallets, encryptedHdWallet } = this.encryptWallets(
        decryptedWallets,
        decryptedHdWallet,
      );
      const promises = encryptedWallets.map(encryptedWallet =>
        this.saveWallet({
          json: encryptedWallet,
        }),
      );

      if (encryptedHdWallet) {
        promises.push(
          this.saveWallet({
            json: encryptedHdWallet,
          }),
        );
      }

      if (promises.length === 0) {
        return;
      }

      this.isLoading = true;

      try {
        await Promise.all(promises);

        this.$notify({
          title: 'Password changed successfully',
          type: 'is-success',
        });
      } catch (error) {
        this.$notify({
          title: 'Error while saving wallets',
          text: 'An error occurred while saving wallets. Please try again.',
          type: 'is-danger',
        });
      } finally {
        this.isLoading = false;
        this.oldPassword = null;
        this.newPassword = null;
      }
    },
  },
  components: {
    VForm,
    VButton,
    VPassword,
  },
};
</script>
