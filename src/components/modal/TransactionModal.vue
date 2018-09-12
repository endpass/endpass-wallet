<template lang="html">
  <div class="transaction-modal">
    <v-modal @close="close">
      <template slot="header">Are you sure?</template>

      <div>
        <table class="table">
          <thead>
            <tr>
              <th colspan="2">Transaction</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th>To</th>
              <th>{{ transaction.to }}</th>
            </tr>
            <tr>
              <th>Amount</th>
              <th>{{ transaction.value }} {{ transaction.tokenInfo && transaction.tokenInfo.symbol || activeCurrency.name }}</th>
            </tr>
            <tr>
              <th>Gas price</th>
              <th>{{ transaction.gasPrice }} GWEI</th>
            </tr>
            <tr>
              <th>Gas limit</th>
              <th>{{ transaction.gasLimit }}</th>
            </tr>
            <tr>
              <th>Data</th>
              <th>{{ transaction.data }}</th>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        slot="footer"
        class="buttons"
      >
        <a
          class="button is-primary"
          @click="confirm"
        >
          Confirm
        </a>
        <a
          class="button"
          @click="close"
        >
          Cancel
        </a>
      </div>

    </v-modal>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import VModal from '@/components/ui/VModal';

export default {
  name: 'transaction-modal',
  props: {
    transaction: {
      type: Object,
      required: true,
    },
  },
  computed: {
    ...mapState({
      activeCurrency: state => state.web3.activeCurrency,
    }),
  },
  methods: {
    confirm() {
      this.$emit('confirm');
    },
    close() {
      this.$emit('close');
    },
  },
  components: {
    VModal,
  },
};
</script>
