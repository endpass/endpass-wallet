<template>
  <div class="field">
    <div class="control">
      <a :id="id"
         :disabled="disabled"
         class="button is-primary is-medium"
         @click.prevent="$emit('click', $event)">
        <slot />
      </a>
    </div>
  </div>
</template>

<script>
export default {
  name: 'v-button',
  props: {
    id: {
      type: String,
      default: '',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style lang="scss">
</style>
