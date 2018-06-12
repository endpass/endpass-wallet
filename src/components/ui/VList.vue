<template>
  <div class="menu">
    <p class="menu-label"
       v-if="label">{{ label }}</p>
    <ul class="menu-list"
        v-if="!isEmpty">
      <li v-for="(value, key) in list"
          :key="key">
        <a @click.prevent="active = key"
           :class="{'is-active': active === key}">{{ value }}</a>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'v-list',
  data: () => ({
    active: null,
  }),
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
  computed: {
    isEmpty() {
      return !Object.keys(this.list).length;
    }
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
