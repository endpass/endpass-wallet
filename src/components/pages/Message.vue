<template>
  <div class="app-page">
    <div class="section">
      <div class="container is-narrow">
        <div class="card app-card main-app-card">
          <div class="card-header">
            <h1 class="card-header-title">Message</h1>
          </div>
          <div class="card-content">
            <sign-message/>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SignMessage from '@/components/SignMessage';

export default {
  name: 'message-page',
  components: {
    SignMessage
  }
};
</script>
