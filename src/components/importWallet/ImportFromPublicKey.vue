<template>
  <v-form
    :is-form-valid="isFormValid"
    data-test="import-public-form"
    @submit="submitAddWallet"
  >
    <v-input
      id="address"
      key="publicKeyUnique"
      v-model="address"
      v-validate="'required|address'"
      :error="errors.first('address')"
      :label="$t('components.importFromPublicKey.address')"
      name="address"
      data-vv-name="address"
      :data-vv-as="$t('components.importFromPublicKey.address')"
      aria-describedby="address"
      :placeholder="$t('components.importFromPublicKey.address')"
      required
      data-test="input-public-key"
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
</template>

<script>
import { mapActions } from 'vuex';
import formMixin from '@/mixins/form';

export default {
  name: 'ImportFromPublicKey',
  data: () => ({
    isCreating: false,
    address: '',
  }),
  methods: {
    ...mapActions('accounts', ['addWalletWithPublicKey']),
    async submitAddWallet() {
      this.isCreating = true;
      try {
        await this.addWalletWithPublicKey(this.address);
        this.$router.push('/');
      } catch (e) {
        this.errors.add({
          field: 'address',
          msg: this.$t('components.importFromPublicKey.addressInvalid'),
          id: 'wrongAddress',
        });
        /* eslint-disable-next-line no-console */
        console.error(e);
      } finally {
        this.isCreating = false;
      }
    },
    handleInput() {
      this.errors.removeById('wrongAddress');
    },
  },
  mixins: [formMixin],
};
</script>

<style lang="scss"></style>
