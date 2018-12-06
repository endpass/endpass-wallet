<template>
  <div class="search-control field is-expanded has-addons">
    <div class="control is-expanded has-icons-left">
      <input
        :value="value"
        class="input is-small"
        type="text"
        placeholder="search"
        @input="$emit('input', $event.target.value)"
      >
      <span
        class="icon is-small is-left"
        v-html="require('@/img/magnifying-glass.svg')"
      />
    </div>

    <div class="control">
      <a
        class="button is-small is-white"
        @click="$emit('input', '')"
      >
        <span
          class="icon is-small"
          v-html="require('@/img/x.svg')"
        />
      </a>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SearchInput',
  props: {
    value: {
      type: String,
      default: '',
    },
  },
};
</script>
