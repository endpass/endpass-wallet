<template>
  <div class="search-control field is-expanded has-addons">
    <div class="control is-expanded has-icons-left">
      <input :value="value" @input="$emit('input', $event.target.value)" class="input is-small" type="text" placeholder="search">
      <span class="icon is-small is-left"
            v-html="require('@/img/magnifying-glass.svg')">
      </span>
    </div>

    <div class="control">
      <a class="button is-small is-white" @click="$emit('input', '')">
        <span class="icon is-small" v-html="require('@/img/x.svg')">
        </span>
      </a>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    value: String,
  },
};
</script>
