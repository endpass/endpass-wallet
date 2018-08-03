<template lang="html">
  <div class="password-congirm-modal">
    <v-modal @close="close">
      <template slot="header">Password confirmation required</template>

      <div>
        <v-form @submit="confirm">
          <slot></slot>
          <v-password v-model="jsonKeystorePassword"
                   @input="handleInput"
                   label="V3 JSON keystore password"
                   name="jsonKeystorePassword"
                   validator="required"
                   data-vv-as="password"
                   aria-describedby="jsonKeystorePassword"
                   placeholder="V3 JSON keystore password"
                   required />
          <v-button className="is-primary is-medium"
                    :loading="proccessingCongirmation">Confirm</v-button>
        </v-form>
      </div>
    </v-modal>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import VModal from '@/components/ui/VModal';
import VForm from '@/components/ui/form/VForm.vue';
import VPassword from '@/components/ui/form/VPassword.vue';
import VButton from '@/components/ui/form/VButton.vue';

export default {
  name: 'password-modal',
  data() {
    return {
      jsonKeystorePassword: '',
      proccessingCongirmation: false,
    };
  },
  methods: {
    ...mapActions('accounts', ['validatePassword']),
    confirm() {
      this.proccessingCongirmation = true;
      const { jsonKeystorePassword: password } = this;

      this.validatePassword(password)
        .then(() => {
          this.proccessingCongirmation = false;
          this.$emit('confirm', password);
        })
        .catch(() => {
          this.proccessingCongirmation = false;
          this.errors.add({
            field: 'jsonKeystorePassword',
            msg: 'Password is invalid',
            id: 'wrongPassword',
          });
        });
    },
    close() {
      this.$emit('close');
    },
    handleInput() {
      this.errors.removeById('wrongPassword');
    },
  },
  components: {
    VModal,
    VForm,
    VPassword,
    VButton,
  },
};
</script>

<style lang="scss">
</style>
