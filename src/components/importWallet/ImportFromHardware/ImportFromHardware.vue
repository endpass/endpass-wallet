<template>
  <div>
    <hardware-chooser
      v-if="!hardwareType"
      v-model="hardwareType"
    />
    <hardware-list
      v-else
      :wallet-type="hardwareType"
    />
  </div>
</template>

<script>
import HardwareChooser from './HardwareChooser';
import HardwareList from './HardwareList';

export default {
  name: 'ImportFromHardware',
  data: () => ({
    hardwareType: null,
  }),
  components: {
    HardwareChooser,
    HardwareList,
  },
};
</script>

<style lang="scss">
</style>
