<template>
  <div class="app-page">
    <div class="section">
      <div class="container is-narrow">
        <div class="card app-card main-app-card">
          <div class="card-header">
            <h1 class="card-header-title">
              <slot name="title"></slot>
            </h1>
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
  name: 'base-page',
};
</script>
