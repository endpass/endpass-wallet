<template>
  <div class="menu">
    <p
      v-if="label"
      class="menu-label"
    >
      {{ label }}
    </p>
    <ul
      v-if="!isEmpty"
      class="menu-list"
    >
      <li
        v-for="(value, key) in list"
        :key="key"
      >
        <a
          :class="{'is-active': active === key}"
          @click.prevent="active = key"
        >
          {{ value }}
        </a>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'VList',
  props: {
    label: {
      type: String,
      default: null,
    },
    list: {
      type: Object,
      default: () => ({}),
    },
  },
  data: () => ({
    active: null,
  }),
  computed: {
    isEmpty() {
      return !Object.keys(this.list).length;
    },
  },
  watch: {
    active(val) {
      this.$emit('input', val);
    },
    list: {
      handler(val) {
        this.active = Object.keys(val).find(v => !!v);
      },
      immediate: true,
    },
  },
};
</script>

<style lang="scss">
</style>
