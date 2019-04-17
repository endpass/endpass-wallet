<template>
  <div>
    <hardware-chooser
      v-if="!hardwareType"
      v-model="hardwareType"
    />
    <wallets-list
      v-else
      :type="hardwareType"
      :is-importing="bridgeButtonListIsImporting"
      v-model="bridgeButtonListIsLoading"
      @select="setSelectedAddress"
    >
      <wallet-add-button
        slot="buttons"
        :type="hardwareType"
        :selected-address="bridgeButtonListSelectedAddress"
        v-model="bridgeButtonListIsImporting"
        @success="$router.push('/')"
      >Import</wallet-add-button>
    </wallets-list>
  </div>
</template>

<script>
import HardwareChooser from './HardwareChooser.vue';
import { BridgeButtonListMixin } from '@/components/walletsListFromHd';

export default {
  name: 'ImportFromHardware',
  data: () => ({
    hardwareType: null,
  }),
  mixins: [BridgeButtonListMixin],
  components: { HardwareChooser },
};
</script>
