<template>
  <div class="priority-options field is-horizontal">
    <div class="field-label">
      <label class="label">Priority</label>
    </div>
    <div class="field-body">
      <v-radio
        v-if="suggestedGasPrices"
        id="priority"
        :options="suggestedGasPrices"
        :value="value"
        name="priority"
        @input="emitPriorityInput"
      />
      <v-spinner v-else-if="isLoading" />
      <p
        v-else
        class="help is-danger"
      >
        Unable to load suggested gas price, please set gas price
        manually.
      </p>
    </div>
  </div>
</template>

<script>
import VRadio from '@/components/ui/form/VRadio';

export default {
  name: 'TransactionPriorityOptions',

  props: {
    isLoading: {
      type: Boolean,
      default: false,
    },

    prices: {
      type: Object,
      default: () => ({}),
    },

    value: {
      type: String,
      required: true,
    },
  },

  computed: {
    suggestedGasPrices() {
      const { prices } = this;

      if (prices) {
        return [
          {
            val: prices.low.toString(),
            key: 'Low',
            help: `${prices.low} Gwei`,
          },
          {
            val: prices.medium.toString(),
            key: 'Medium',
            help: `${prices.medium} Gwei`,
          },
          {
            val: prices.high.toString(),
            key: 'High',
            help: `${prices.high} Gwei`,
          },
        ];
      }

      return null;
    },
  },

  methods: {
    emitPriorityInput(value) {
      this.$emit('input', value);
    },
  },

  components: {
    VRadio,
  },
};
</script>
