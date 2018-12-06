<template>
  <div>
    <v-form 
      data-test="import-json-form" 
      @submit="togglePasswordModal"
    >
      <div class="field">
        <div class="file">
          <label class="file-label">
            <input
              v-validate="'required'"
              class="file-input"
              type="file"
              name="jsonWallet"
              data-test="input-file"
              @change="setFile"
            >
            <span class="file-cta">
              <span class="file-icon">
                <span 
                  class="icon is-small" 
                  v-html="require('@/img/arrow-thick-top.svg')"
                />
              </span>
              <span 
                class="file-label" 
                v-text="fileName"
              />
            </span>
          </label>
        </div>
        <p 
          v-show="errors.has('fileName')" 
          class="help is-danger"
        >{{ errors.first('fileName') }}</p>
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
        required
        data-test="input-json-file-password"
      />

      <v-button
        :loading="isCreating"
        class-name="is-primary is-cta"
        data-test="submit-import"
      >Import</v-button>
    </v-form>

    <password-modal
      v-if="isPasswordModal"
      @close="togglePasswordModal"
      @confirm="handlePasswordConfirm"
    >The wallet password will be used for operations on the imported wallet</password-modal>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import VForm from '@/components/ui/form/VForm';
import VPassword from '@/components/ui/form/VPassword';
import VButton from '@/components/ui/form/VButton';
import PasswordModal from '@/components/modal/PasswordModal';
import modalMixin from '@/mixins/modal';
import keystore from '@/utils/keystore';

export default {
  name: 'ImportFromJson',
  data: () => ({
    isCreating: false,
    jsonKeystorePassword: '',
    file: null,
    fileData: null,
  }),
  computed: {
    fileName() {
      const { file } = this;

      return file ? file.name : 'V3 JSON keystore file';
    },
  },
  watch: {
    jsonKeystorePassword() {
      this.errors.removeById('wrongPass');
    },
  },
  methods: {
    ...mapActions('accounts', ['addWalletWithV3']),
    async handlePasswordConfirm(walletPassword) {
      this.isCreating = true;
      this.togglePasswordModal();

      try {
        await this.addWalletWithV3({
          json: this.fileData,
          jsonPassword: this.jsonKeystorePassword,
          walletPassword,
        });

        this.$router.push('/');
      } catch (e) {
        this.errors.add({
          field: 'jsonKeystorePassword',
          msg: 'JSON password is invalid',
          id: 'wrongPass',
        });
      }

      this.isCreating = false;
    },
    setFile({ target: { files } }) {
      const [file] = files;

      this.errors.removeById('wrongFile');
      this.fileData = null;
      this.file = file;

      if (!this.file) {
        return;
      }

      const reader = new FileReader();
      const fileReaderError = {
        field: 'fileName',
        msg: 'File is invalid',
        id: 'wrongFile',
      };

      reader.onload = ({ target: { result } }) => {
        try {
          const fileData = JSON.parse(result);

          if (keystore.isV3(fileData)) {
            this.fileData = fileData;
          } else {
            this.errors.add(fileReaderError);
          }
        } catch (e) {
          this.errors.add(fileReaderError);
        }
      };

      reader.onerror = () => this.errors.add(fileReaderError);

      reader.readAsText(this.file);
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
