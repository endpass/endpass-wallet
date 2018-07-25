<template>
  <div class="columns">
    <div class="column">
      <p class="heading">Ethereum Address</p>
      <div class="address">
        <img class="identicon" :src="icon">
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
import makeBlockie from 'ethereum-blockies-base64';
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
      return makeBlockie(seed);
    },
  },
};
</script>

<style>
.identicon {
  display: inline-block;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
}
</style>
