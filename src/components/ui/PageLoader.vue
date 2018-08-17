<template>
  <div v-if="isLoading" class="page-loader modal is-active">
    <div class="page-loader-logo">
      <img src="/static/logo-dark.png" alt="Endpass">
    </div>
    <div class="spinner">
      <div class="spinner-dot spinner-dot-1">
      </div>
      <div class="spinner-dot spinner-dot-2">
      </div>
      <div class="spinner-dot spinner-dot-3">
      </div>
      <p class="spinner-caption">Please wait...</p>
    </div>
  </div>
</template>

<script>
// Loading indicator that covers the entire page
export default {
  name: 'page-loader',
  computed: {
    isLoading() {
      return this.$store.state.isPageLoading;
    },
  },
};
</script>

<style lang="scss">
.page-loader {
  background-color: $purple;

  .page-loader-logo img {
    height: auto;
    width: auto;
    margin: auto;
    max-height: 6rem;
  }

  .spinner {
    color: $white;

    .spinner-dot {
      width: 18px;
      height: 18px;
      background-color: $white;

      border-radius: 100%;
      display: inline-block;
      animation: bouncedelay 1.4s infinite ease-in-out both;
    }

    .spinner-dot-1 {
      animation-delay: -0.32s;
    }
    .spinner-dot-2 {
      animation-delay: -0.16s;
    }
  }
  @keyframes bouncedelay {
    0%,
    80%,
    100% {
      transform: scale(0);
    }
    40% {
      transform: scale(1);
    }
  }
}
</style>
