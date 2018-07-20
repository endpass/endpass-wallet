<template>
  <div class="columns">
    <div class="column">
      <p class="heading">Ethereum Address</p>
      <p class="code address">
        <img :src="icon"> {{ address }}
      </p>
    </div>
    <div class="column">
      <balance :amount="balance" />
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
    balance: {
      type: String,
      default: '0',
    },
    iconColor: {
      type: String,
      default: '#dfe',
    },
    iconBgColor: {
      type: String,
      default: '#aaa',
    },
    iconSize: {
      type: Number,
      default: 10,
    },
    iconScale: {
      type: Number,
      default: 2,
    },
    iconSpotColor: {
      type: String,
      default: '#000',
    },
  },
  computed: {
    icon() {
      const {
        address: seed,
        iconColor: color,
        iconBgColor: bgcolor,
        iconSize: size,
        iconScale: scale,
        iconSpotColor: spotcolor,
      } = this;

      return blockies
        .create({ seed, color, bgcolor, size, scale, spotcolor })
        .toDataURL();
    },
  },
};
</script>

<style>
</style>
