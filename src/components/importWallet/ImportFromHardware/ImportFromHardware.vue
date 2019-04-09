<template>
  <div>
    <hardware-chooser
      v-if="!hardwareType"
      v-model="hardwareType"
    />
    <wallets-list
      v-else
      :type="hardwareType"
    />
  </div>
</template>

<script>
import HardwareChooser from './HardwareChooser.vue';
import WalletsList from '@/components/walletsList';

export default {
  name: 'ImportFromHardware',
  data: () => ({
    hardwareType: null,
  }),
  components: {
    HardwareChooser,
    WalletsList,
  },
};
</script>

<style lang="scss"></style>
