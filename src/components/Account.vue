<template>
  <div class="media account">
    <div class="media-left">
        <p class="image is-32x32">
          <img class="identicon" :src="icon">
        </p>
    </div>
    <div class="media-content">
      <div class="content">
        <h5 class="is-size-5">{{ address }}</h5>

        <slot></slot>
      </div>
    </div>
    <div class="media-right">
      <balance :amount="balance" />
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

<style lang="scss">
.account {
}

.identicon {
  display: inline-block;
  width: 100%;
  height: auto;
  border-radius: 50%;
}
</style>
