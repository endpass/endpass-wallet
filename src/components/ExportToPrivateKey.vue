<template>
  <div class="export-private-key">
    <div v-if="!privateKey">
      <p class="subtitle">Click the button below to display your private key</p>
      <a class="button is-primary" :class="{'is-loading' : exportingKey }" @click="openPasswordModal">Show Private
      Key</a>
    </div>
    <div v-else>
      <p class="subtitle">Your private key is below. Do not share it with
      anyone!</p>
      <p class="code">{{privateKey}}</p>
      <p>
        <a class="button is-light" @click="privateKey=null">Close</a>
      </p>
    </div>
    <password-modal v-if="passwordModalOpen" @close="closePasswordModal" @confirm="getPrivateKey"></password-modal>
  </div>
</template>


<script>
import PasswordModal from '@/components/modal/PasswordModal';
import { mapState } from 'vuex';

export default {
  name: 'ExportToPrivateKey',
  data() {
    return {
      privateKey: null,
      passwordModalOpen: false,
      exportingKey: false,
    };
  },
  computed: {
    ...mapState({
      wallet: state => state.accounts.wallet,
    }),
  },
  methods: {
    openPasswordModal() {
      this.passwordModalOpen = true;
    },
    closePasswordModal() {
      this.passwordModalOpen = false;
    },
    async getPrivateKey(password) {
      this.closePasswordModal();
      if (this.wallet) {
        this.exportingKey = true;
        await new Promise(res => setTimeout(res, 20));
        try {
          this.privateKey = await this.wallet.getPrivateKeyString(password);
        } catch (e) {
          this.exportError(e);
        }
        this.exportingKey = false;
      }
    },
    exportError(e) {
      this.exportingKey = false;
      this.$notify({
        title: 'Error exporting to private key',
        text:
          'Could not get private key with your wallet and password. Please try again.',
        type: 'is-danger',
      });
      console.error(e);
    },
  },
  components: {
    PasswordModal,
  },
};
</script>
