<template>
  <div v-if="isLoading" class="spinner">
    <spinner :status="isLoading" :color="color" />
  </div>
</template>

<script>
import Spinner from 'vue-spinner-component/src/Spinner';

export default {
  name: 'v-spinner',
  data() {
    return {
      color: '#4b0472' // scss $primary color
    };
  },
  props: {
    isLoading: {
      type: Boolean,
      default: false,
    },
  },
  components: { Spinner }
};
</script>

<style lang="scss" scoped>
  .spinner {
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>
