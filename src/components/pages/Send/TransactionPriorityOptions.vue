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
        v-model="transaction.gasPrice"
        name="priority"
      />
      <v-spinner v-else-if="isLoadingGasPrice" />
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
export default {
  name: 'TransactionPriorityOptions',
};
</script>
