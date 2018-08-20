<template>
  <div v-if="isLoading" class="v-spinner is-overlay">
    <div class="spinner loader"></div>
    <p v-if="label" class="spinner-label">{{ label }}</p>
  </div>
</template>

<script>
export default {
  name: 'v-spinner',
  props: {
    isLoading: {
      type: Boolean,
      default: false,
    },
    label: {
      type: String,
      default: '',
    },
  },
};
</script>

<style lang="scss">
.v-spinner {
  background-color: rgba(10, 10, 10, 0.66);
  display: flex;
  justify-content: center;
  align-items: center;

  pointer-events: none;

  &.is-transparent {
    background-color: transparent;
  }

  .spinner {
    display: flex;
    margin: 0 auto;
  }

  .spinner-label {
    color: $white;
    margin-left: 0.2em;
  }

  // Extends Loader class from bulma
  &.is-large .loader {
    height: 2em;
    width: 2em;
  }
}

// Overlay on relative positioned element
.is-overlay {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 40;
  width: 100%;
  height: 100%;
}

// Style for parent element. Parent must have class "has-spinner"!
.has-spinner {
  position: relative;
}
</style>
