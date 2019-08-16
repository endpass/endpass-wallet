<template>
  <div class="column">
    <v-list
      v-model="hardwareType"
      :has-default-active="false"
      :list="hardwareList"
      :label="$t('components.hardwareChooser.chooseHardwareType')"
    />
  </div>
</template>

<script>
import { Wallet } from '@/class';

const WALLET_TYPES = Wallet.getTypes();

const hardwareList = {
};

export default {
  name: 'HardwareChooser',
  data: function () {
    hardwareType: null,
    hardwareList: {
      [WALLET_TYPES.LEDGER]: thiss.$t('components.hardwareChooser.ledgerWallet'),
      [WALLET_TYPES.TREZOR]: thiss.$t('components.hardwareChooser.trezorWallet'),
    },
  },
  watch: {
    hardwareType(type) {
      this.$emit('input', type);
    },
  },
};
</script>

<style lang="scss"></style>
