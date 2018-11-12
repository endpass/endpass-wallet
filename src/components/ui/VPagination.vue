<template>
  <div class="card-header">
    <a
      v-if="page > 1"
      class="card-header-icon"
      @click.prevent="changePage(-1)"
    >
      &lt; Back
    </a>
    <a
      class="card-header-icon"
      @click.prevent="changePage(1)"
    >
      Next &gt;
    </a>
  </div>
</template>

<script>
export default {
  name: 'VPagination',
  data: () => ({
    page: 1,
  }),
  methods: {
    changePage(diff) {
      this.page += diff;
      this.$emit('input', this.page);
    },
  },
};
</script>

<style lang="scss">
</style>
