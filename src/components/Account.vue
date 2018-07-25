<template>
  <div class="columns">
    <div class="column">
      <p class="heading">Ethereum Address</p>
      <p class="code address">
        <img :src="icon"> {{ address }}
      </p>
    </div>
    <div class="column">
      <balance :amount="balance" :currency="currency" />
    </div>
  </div>
</template>

<script>
import blockies from 'ethereum-blockies';
import Balance from '@/components/Balance';

export default {
  name: 'Account',
  components: { Balance },
  props: {
    address: {
      type: String,
      required: true,
    },
    currency: {
      type: String,
      default: 'ETH'
    },
    balance: {
      type: String,
      default: '0',
    },
  },
  computed: {
    icon() {
      const seed = this.address.toLowerCase();
      console.log(seed);
      return blockies
        .create({ seed:seed, size: 8, scale: 16})
        .toDataURL();
    },
  },
};
</script>

<style>
</style>
