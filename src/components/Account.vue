<template>
  <div class="media account">
    <div class="media-left">
        <p class="image is-32x32">
          <img class="identicon" :src="icon">
        </p>
    </div>
    <div class="media-content">
      <div class="content">
        <h5 class="address">{{ addressFmt }}</h5>
        <slot></slot>
      </div>
    </div>
    <div class="media-right">
        <balance v-if="balance && balance.length" :amount="balance"
        :currency="currency" />
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
      default: 'ETH',
    },
    balance: {
      type: String,
    },
    // Maximum length of address
    size: {
      type: Number,
      default: 50,
    },
  },
  computed: {
    icon() {
      const seed = '0x' + this.address.toLowerCase().replace(/^0x/, '');
      return makeBlockie(seed);
    },
    addressFmt() {
      if (this.address.length <= this.size) {
        return this.address;
      } else if (this.size === 0) {
        return '';
      } else {
        return '...' + this.address.substr(this.address.length - this.size);
      }
    },
  },
};
</script>

<style lang="scss">
.account {
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
