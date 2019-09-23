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
import i18n from '@/locales/i18n';

const WALLET_TYPES = Wallet.getTypes();

export default {
  name: 'HardwareChooser',
  data: () => ({
    hardwareType: null,
    hardwareList: {
      [WALLET_TYPES.LEDGER]: i18n.$t('components.hardwareChooser.ledgerWallet'),
      [WALLET_TYPES.TREZOR]: i18n.$t('components.hardwareChooser.trezorWallet'),
    },
  }),
  watch: {
    hardwareType(type) {
      this.$emit('input', type);
    },
  },
};
</script>

<style lang="scss"></style>
