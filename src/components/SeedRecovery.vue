<template>
  <div>
    <label class="label">Seed Phrase Recovery</label>
    <v-button
      :disabled="isLocked || isLoading"
      class-name="is-primary is-medium"
      data-test="recover-seed-button"
      @click="handleRecoverButtonClick"
    >
      Recover seed phrase
    </v-button>
    <password-modal
      v-if="isPasswordModalVisible"
      :disabled="recoveredSeed || isLocked"
      @confirm="handleRecoveryConfirm"
      @close="handleRecoveryClose"
    />
    <info-modal
      v-if="recoveredSeed"
      title="Seed recovering"
      description="You successfully recovered seed phrase! Do not show it to anyone else!"
      @close="handleSeedClose"
    >
      <p class="code" data-test="recovered-seed-phrase">{{ recoveredSeed }}</p>
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
    isLocked: {
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

    handleRecoveryClose() {
      this.isPasswordModalVisible = false;
    },

    async handleRecoveryConfirm(password) {
      this.isLoading = true;

      try {
        const res = await this.recoverSeed(password);

        this.recoveredSeed = res;
      } catch (err) {
        console.log(err);
        this.$emit('lock');
      } finally {
        this.isPasswordModalVisible = false;
        this.isLoading = false;
      }
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
