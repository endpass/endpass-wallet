<template lang="html">
  <div class="export-json">
    <v-form>

      <v-button :loading="exportingJson"
                className="is-primary is-medium"
                @click.prevent="openPasswordModal">Export</v-button>

    </v-form>
    <password-modal v-if="passwordModalOpen" @confirm="exportJSON" @close="closePasswordModal"></password-modal>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import PasswordModal from '@/components/modal/PasswordModal'
import VForm from '@/components/ui/form/VForm';
import VInput from '@/components/ui/form/VInput';
import VButton from '@/components/ui/form/VButton';

export default {
  data: () => ({
    exportingJson: false,
    passwordModalOpen: false
  }),
  computed: {
    ...mapState({
      wallet: state => state.accounts.wallet
    })
  },
  methods: {
    async exportJSON(password) {
      this.closePasswordModal();
      if (this.wallet) {
        this.exportingJson = true;
        await new Promise(res => setTimeout(res, 20));
        try {
          this.saveJSON(this.wallet.exportToJSON(password, password));
        } catch (e) {
          this.exportError(e);
        }
        this.exportingJson = false;
      }
    },
    saveJSON(data) {
      const address = this.wallet.getAddressString();
      const filename = `endpass_wallet_${address}.json`;
      const blob = new Blob([data], { type: 'text/json' });
      const e = document.createEvent('MouseEvents');
      const a = document.createElement('a');

      a.download = filename;
      a.href = window.URL.createObjectURL(blob);
      a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');
      e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
      a.dispatchEvent(e);
      a.remove();
      this.exportingJson = false;
    },
    exportError(e) {
      this.exportingJson = false;
      this.$notify({
        title: 'Error exporting to JSON',
        text: 'Could not create file with your wallet. Please try again.',
        type: 'is-danger',
      });
      console.error(e);
    },
    openPasswordModal() {
      this.passwordModalOpen = true;
    },
    closePasswordModal() {
      this.passwordModalOpen = false;
    }
  },
  components: {
    VForm,
    VInput,
    VButton,
    PasswordModal
  },
};
</script>

<style lang="scss">
</style>
