<template>
  <div class="priority-options field is-horizontal">
    <div class="field-label">
      <label class="label">{{$t('components.transactionPriorityOptions.priority')}}</label>
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
        {{$t('components.transactionPriorityOptions.loadError')}}
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TransactionPriorityOptions',

  inject: ['$validator'],

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

      if (!prices) {
        return null;
      }

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
    },
  },

  methods: {
    emitPriorityInput(value) {
      this.$emit('input', value);
    },
  },
};
</script>
