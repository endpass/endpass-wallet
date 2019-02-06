<template>
  <div class="media account">
    <div class="media-left">
      <p class="image is-32x32">
        <img :src="icon" class="identicon" />
      </p>
    </div>
    <div class="media-content">
      <div class="content">
        <h5 class="address" data-test="account-address">{{ addressFmt }}</h5>
        <slot />
      </div>
    </div>
    <div class="media-right">
      <slot name="balance">
        <balance
          v-if="balance && balance.length"
          slot="balance"
          :amount="balance"
          :currency="currency"
        />
      </slot>
    </div>
  </div>
</template>

<script>
import makeBlockie from 'ethereum-blockies-base64';
import Balance from '@/components/Balance';
import { getShortStringWithEllipsis } from '@endpass/utils/strings';

export default {
  name: 'Account',
  props: {
    address: {
      type: String,
      required: true,
    },
    currency: {
      type: String,
      default: 'ETH',
    },
    balance: {
      type: String,
      default: null,
    },
    // Maximum length of address
    size: {
      type: Number,
      default: 50,
    },
  },
  computed: {
    icon() {
      const seed = `0x${this.address.toLowerCase().replace(/^0x/, '')}`;

      return makeBlockie(seed);
    },
    addressFmt() {
      if (this.address.length <= this.size) {
        return this.address;
      }

      if (this.size === 0) {
        return '';
      }

      if (this.size < 8) {
        return `...${this.address.substr(this.address.length - this.size)}`;
      }

      return getShortStringWithEllipsis(
        this.address,
        Math.round(this.size / 2),
      );
    },
  },
  components: { Balance },
};
</script>

<style lang="scss">
.account {
  display: flex;
  align-items: center;

  .media-content {
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .address {
    font-size: 1.25rem;
    margin: 0;
    max-height: 32px;
  }

  &.small {
    align-items: center;
    justify-content: center;
    text-align: center;
    .media-left,
    .media-right {
      margin: 0;
    }
    .media-content {
      display: none;
    }
  }
}

.identicon {
  display: inline-block;
  width: 100%;
  height: auto;
  border-radius: 50%;
}
</style>
