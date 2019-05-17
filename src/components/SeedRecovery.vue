<template>
  <div>
    <label class="label">Seed Phrase Recovery</label>
    <v-button
      :disabled="locked || isLoading"
      class-name="is-primary is-medium"
      data-test="recover-seed-button"
      @click="handleRecoverButtonClick"
    >
      Recover seed phrase
    </v-button>
    <password-modal
      v-if="isPasswordModalVisible"
      :disabled="recoveredSeed || locked"
      @confirm="handleRecoveryConfirm"
      @cancel="handleRecoveryCancel"
    />
    <info-modal
      v-if="recoveredSeed"
      :is-success="true"
      title="Seed recovering"
      sub-title="You successfully recovered seed phrase! Do not show it to anyone else!"
      @close="handleSeedClose"
    >
      <p class="code">{{ recoveredSeed }}</p>
    </info-modal>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import PasswordModal from '@/components/modal/PasswordModal';
import InfoModal from '@/components/modal/InfoModal';

export default {
  name: 'SeedRecovery',

  props: {
    locked: {
      type: Boolean,
      default: false,
    },
  },

  data: () => ({
    recoveredSeed: null,
    isLoading: false,
    isPasswordModalVisible: false,
  }),

  methods: {
    ...mapActions('accounts', ['recoverSeed']),

    handleRecoverButtonClick() {
      this.isPasswordModalVisible = true;
    },

    handleRecoveryCancel() {
      this.isPasswordModalVisible = false;
    },

    async handleRecoveryConfirm(password) {
      this.isLoading = true;

      const res = await this.recoverSeed(password);

      if (!res) {
        this.$emit('lock');
      } else {
        this.recoveredSeed = res;
      }

      this.isPasswordModalVisible = false;
      this.isLoading = false;
    },

    handleSeedClose() {
      this.recoveredSeed = null;
    },
  },

  components: {
    PasswordModal,
    InfoModal,
  },
};
</script>

<style lang="scss"></style>
