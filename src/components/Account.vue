<template>
  <div class="columns">
    <div class="column">
      <p class="heading">Ethereum Address</p>
      <div class="address">
        <div class="identicon" :style="{ backgroundImage: 'url(' + icon + ')' }"></div>
        <p class="code">
          {{ address }}
        </p>
      </div>
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
      return blockies
        .create({ seed:seed, size: 8, scale: 16})
        .toDataURL();
    },
  },
};
</script>

<style>
.identicon {
  display: inline-block;
  width: 2rem;
  height: 2rem;
  background-size:cover;
  background-repeat: no-repeat;
  border-radius: 50%;
}
</style>
