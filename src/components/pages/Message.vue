<template>
  <div class="app-page">
    <div class="section">
      <div class="container is-narrow">
        <div class="card app-card main-app-card">
          <div class="card-header">
            <h1 class="card-header-title">Message</h1>
          </div>
          <div class="card-content">
            <div class="tabs">
              <ul>
                <li :class="[ isSignTabActive ? 'is-active' : '']">
                  <a @click="setSignTabActive">Sign</a>
                </li>
                <li :class="[ isVerifyTabActive ? 'is-active' : '']">
                  <a @click="setVerifyTabActive">Verify</a>
                </li>
              </ul>
            </div>
            <sign-message v-show="isSignTabActive"/>
            <verify-message v-show="isVerifyTabActive"/>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SignMessage from '@/components/SignMessage';
import VerifyMessage from '@/components/VerifyMessage';

const ACTION_TYPES = {
  SIGN: 'SIGN',
  VERIFY: 'VERIFY'
};

export default {
  name: 'message-page',
  data: () => ({
    action: ACTION_TYPES.SIGN
  }),
  computed: {
    isSignTabActive() {
      return this.action === ACTION_TYPES.SIGN;
    },
    isVerifyTabActive() {
      return this.action === ACTION_TYPES.VERIFY;
    }
  },
  methods: {
    setSignTabActive() {
      this.action = ACTION_TYPES.SIGN;
    },
    setVerifyTabActive() {
      this.action = ACTION_TYPES.VERIFY;
    }
  },
  components: {
    SignMessage,
    VerifyMessage
  }
};
</script>
