<template>
  <div class="app-page">
    <div class="section is-narrow app-page-header">
      <div class="container is-narrow">
        <h1 class="page-title">
          <slot name="title" />
        </h1>
      </div>
    </div>
    <div class="section is-narrow app-page-content">
      <div class="container is-narrow">
        <div class="card app-card main-app-card">
          <div class="card-header">
            <a
              class="card-header-icon"
              @click="$router.back()"
            >
              &lt; Back
            </a>
          </div>
          <div class="card-content">
            <slot/>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BasePage',
  inject: ['$validator'],
};
</script>

<style lang="scss">
// Container for a single page in the app
.app-page {
  .app-page-header {
    &.section {
      padding-bottom: 0;
    }
  }
  .app-page-content {
  }
  .page-title {
    font-size: 2rem;
  }
  // Card container inside the app
  .app-card {
    // Main card component in the app
    &.main-app-card {
      margin-bottom: 2rem;
      min-height: 60vh;
    }

    .card-header-title {
      font-size: 1.2em;
      font-family: $heading-font-family;
      color: $purple;
    }
  }
}
</style>
