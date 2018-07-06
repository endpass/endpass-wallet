<template>
  <div class="export-private-key">
    <div v-if="!privateKey">
      <p class="subtitle">Click the button below to display your private key</p>
      <a class="button is-primary" @click="openPasswordModal">Show Private
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

import PasswordModal from '@/components/modal/PasswordModal'
import { mapState } from 'vuex';

export default {
  data () {
    return {
      privateKey: null,
      passwordModalOpen: false
    }
  },
  computed: {
    ...mapState({
      wallet: state => state.accounts.wallet
    })
  },
  methods : {
    openPasswordModal() {
      this.passwordModalOpen = true;
    },
    closePasswordModal() {
      this.passwordModalOpen = false;
    },
    async getPrivateKey(password = '') {
      await new Promise(res => setTimeout(res, 20));
      this.privateKey = this.wallet.getPrivateKeyString(password);
    },
  },
  components: {
    PasswordModal
  }
}
</script>
