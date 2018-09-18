<template>
  <div>
    <v-form @submit="togglePasswordModal">
      <v-input
        id="hdkeySeed"
        key="hdkeyPhraseUnique"
        v-model="key"
        label="Seed phrase"
        name="hdkeyPhrase"
        validator="required|seed_phrase"
        data-vv-as="seed phrase"
        aria-describedby="hdkeyPhrase"
        placeholder="Seed phrase"
        required
        @input="handleInput"
      />

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
    />
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import VForm from '@/components/ui/form/VForm';
import VInput from '@/components/ui/form/VInput';
import VButton from '@/components/ui/form/VButton';
import PasswordModal from '@/components/modal/PasswordModal';
import modalMixin from '@/mixins/modal';

export default {
  name: 'ImportFromSeed',
  data: () => ({
    isCreating: false,
    key: '',
  }),
  methods: {
    ...mapActions('accounts', ['addMultiHdWallet']),
    async handlePasswordConfirm(password) {
      this.isCreating = true;

      await new Promise(res => setTimeout(res, 20));

      try {
        this.addMultiHdWallet({
          key: this.key,
          password,
        });
        this.$router.push('/');
      } catch (e) {
        this.errors.add({
          field: 'hdkeyPhrase',
          msg: 'Seed phrase is invalid',
          id: 'wrongPhrase',
        });
        console.error(e);
      }

      this.isCreating = false;
    },
    handleInput() {
      this.errors.removeById('wrongPhrase');
    },
  },
  mixins: [modalMixin],
  components: {
    VForm,
    VInput,
    VButton,
    PasswordModal,
  },
};
</script>

<style lang="scss">
</style>
