<template>
  <div>
    <hardware-chooser
      v-if="!hardwareType"
      v-model="hardwareType"
    />
    <wallets-list
      v-else
      v-model="bridgeButtonListIsLoading"
      :type="hardwareType"
      :is-importing="bridgeButtonListIsImporting"
      @select="setSelectedAddress"
    >
      <wallet-add-button
        slot="buttons"
        v-model="bridgeButtonListIsImporting"
        :type="hardwareType"
        :selected-address="bridgeButtonListSelectedAddress"
        @success="$router.push('/')"
      >
        {{ $t('global.import') }}
      </wallet-add-button>
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
