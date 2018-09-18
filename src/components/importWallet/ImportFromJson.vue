<template>
  <div>
    <v-form @submit="togglePasswordModal">
      <div class="field">
        <div class="file">
          <label class="file-label">
            <input
              class="file-input"
              type="file"
              name="jsonWallet"
              @change="setFile"
            >
            <span class="file-cta">
            <span class="file-icon">
              <span
                class="icon is-small"
                v-html="require('@/img/arrow-thick-top.svg')"
              />
            </span>
            <span class="file-label">
              {{ fileName || 'V3 JSON keystore file' }}
            </span>
          </span>
          </label>
        </div>
        <p
          v-show="errors.has('fileName')"
          class="help is-danger"
        >
          {{ errors.first('fileName') }}
        </p>
      </div>

      <v-password
        id="jsonKeystorePassword"
        key="jsonKeystorePasswordUnique"
        v-model="jsonKeystorePassword"
        label="V3 JSON keystore password"
        name="jsonKeystorePassword"
        validator="required|min:8"
        data-vv-as="password"
        aria-describedby="jsonKeystorePassword"
        placeholder="V3 JSON keystore password"
        required />

      <v-button
        :loading="isCreating"
        class-name="is-primary is-cta"
      >
        Import
      </v-button>
    </v-form>

    <password-modal
      v-if="isPasswordModal"
      @close="togglePasswordModal"
      @confirm="handlePasswordConfirm"
    >
      The wallet password will be used for operations on the imported wallet
    </password-modal>
  </div>
</template>

<script>
import EthWallet from 'ethereumjs-wallet';
import { mapActions } from 'vuex';
import VForm from '@/components/ui/form/VForm';
import VPassword from '@/components/ui/form/VPassword';
import VButton from '@/components/ui/form/VButton';
import PasswordModal from '@/components/modal/PasswordModal';
import modalMixin from '@/mixins/modal';

export default {
  name: 'ImportFromJson',
  data: () => ({
    isCreating: false,
    jsonKeystorePassword: '',
    fileName: '',
    file: null,
  }),
  methods: {
    ...mapActions('accounts', ['addWalletWithV3']),
    handlePasswordConfirm(walletPassword) {
      const reader = new FileReader();
      reader.onload = ({ target: { result: fileData } }) =>
        this.addWalletWithJson(fileData, walletPassword);

      try {
        reader.readAsText(this.file);
      } catch (e) {
        this.errors.add({
          field: 'fileName',
          msg: 'File is invalid',
          id: 'wrongFile',
        });
      }
    },
    async addWalletWithJson(fileData, walletPassword) {
      this.isCreating = true;

      await new Promise(res => setTimeout(res, 20));

      try {
        await this.addWalletWithV3({
          json: JSON.parse(fileData),
          jsonPassword: this.jsonKeystorePassword,
          walletPassword,
        });
        this.$router.push('/');
      } catch (e) {
        let error = {
          field: 'jsonKeystorePassword',
          msg: 'JSON password is invalid',
          id: 'wrongPass',
        };

        if (
          e.message === 'Not a V3 wallet' ||
          e.message.includes('Unexpected token')
        ) {
          error = {
            field: 'fileName',
            msg: 'File is invalid',
            id: 'wrongFile',
          };
        }

        this.errors.add(error);
        this.togglePasswordModal();
      }

      this.isCreating = false;
    },
    setFile(e) {
      this.errors.removeById('wrongFile');

      if (e.target.files[0]) {
        this.fileName = e.target.files[0].name;
        this.file = e.target.files[0];
      } else {
        this.fileName = '';
        this.file = null;
      }
    },
  },
  watch: {
    jsonKeystorePassword() {
      this.errors.removeById('wrongPass');
    },
  },
  mixins: [modalMixin],
  components: {
    VForm,
    VPassword,
    VButton,
    PasswordModal,
  },
};
</script>

<style lang="scss">
</style>
