<template>
  <v-form @submit="parseJson">
    <div class="field">
      <div class="file">
        <label class="file-label">
          <input class="file-input"
                 type="file"
                 name="jsonWallet"
                 @change="setFile">
          <span class="file-cta">
            <span class="file-icon">
              <span class="icon is-small"
                    v-html="require('@/img/arrow-thick-top.svg')"></span>
            </span>
            <span class="file-label">
              {{ fileName || 'V3 JSON keystore file'}}
            </span>
          </span>
        </label>
      </div>
      <p v-show="errors.has('fileName')"
         class="help is-danger">{{ errors.first('fileName') }}</p>
    </div>

    <v-password v-model="jsonKeystorePassword"
             label="V3 JSON keystore password"
             id="jsonKeystorePassword"
             name="jsonKeystorePassword"
             validator="required|min:8"
             data-vv-as="password"
             key="jsonKeystorePasswordUnique"
             aria-describedby="jsonKeystorePassword"
             placeholder="V3 JSON keystore password"
             required />

    <v-button className="is-primary is-cta"
              :loading="isCreating">Import</v-button>
  </v-form>
</template>

<script>
import EthWallet from 'ethereumjs-wallet';
import router from '@/router';
import { mapActions } from 'vuex';
import VForm from '@/components/ui/form/VForm.vue';
import VPassword from '@/components/ui/form/VPassword.vue';
import VButton from '@/components/ui/form/VButton.vue';

export default {
  name: 'import-from-json',
  data: () => ({
    isCreating: false,
    jsonKeystorePassword: '',
    fileName: '',
    file: null,
  }),
  methods: {
    ...mapActions('accounts', ['addWalletWithV3']),
    parseJson() {
      const reader = new FileReader();
      reader.onload = this.addWalletWithJson.bind(this);

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
    async addWalletWithJson(e) {
      this.isCreating = true;

      await new Promise(res => setTimeout(res, 20));

      try {
        this.addWalletWithV3({
          json: e.target.result,
          password: this.jsonKeystorePassword,
        });
        router.push('/');
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
  components: {
    VForm,
    VPassword,
    VButton,
  },
};
</script>

<style lang="scss">
</style>
