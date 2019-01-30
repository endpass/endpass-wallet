<template>
  <div class="column">
    <v-list
      v-model="hardwareType"
      :has-default-active="false"
      :list="hardwareList"
      label="Choose Hardware type"
    />
  </div>
</template>

<script>
import { Wallet } from '@/class';

const WALLET_TYPES = Wallet.getTypes();

const hardwareList = {
  [WALLET_TYPES.LEDGER]: 'Ledger wallet',
  [WALLET_TYPES.TREZOR]: 'Trezor wallet',
};

export default {
  name: 'HardwareChooser',
  data: () => ({
    hardwareType: null,
    hardwareList,
  }),
  watch: {
    hardwareType(type) {
      this.$emit('input', type);
    },
  },
};
</script>

<style lang="scss">
</style>
