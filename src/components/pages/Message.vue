<template>
  <base-page>
    <template slot="title">
      Message
    </template>

    <div class="tabs">
      <ul>
        <li :class="[isSignTabActive ? 'is-active' : '']">
          <a
            data-test="sign-message-tab"
            @click="setSignTabActive"
          >
            Sign
          </a>
        </li>
        <li :class="[isVerifyTabActive ? 'is-active' : '']">
          <a
            data-test="verify-message-tab"
            @click="setVerifyTabActive"
          >
            Verify
          </a>
        </li>
      </ul>
    </div>
    <sign-message v-show="isSignTabActive" />
    <verify-message v-show="isVerifyTabActive" />
  </base-page>
</template>

<script>
import BasePage from '@/components/pages/Base';
import SignMessage from '@/components/SignMessage';
import VerifyMessage from '@/components/VerifyMessage';
import privatePage from '@/mixins/privatePage';

const ACTION_TYPES = {
  SIGN: 'SIGN',
  VERIFY: 'VERIFY',
};

export default {
  name: 'MessagePage',
  data: () => ({
    action: ACTION_TYPES.SIGN,
  }),
  computed: {
    isSignTabActive() {
      return this.action === ACTION_TYPES.SIGN;
    },
    isVerifyTabActive() {
      return this.action === ACTION_TYPES.VERIFY;
    },
  },
  methods: {
    setSignTabActive() {
      this.action = ACTION_TYPES.SIGN;
    },
    setVerifyTabActive() {
      this.action = ACTION_TYPES.VERIFY;
    },
  },

  mixins: [privatePage],

  components: {
    BasePage,
    SignMessage,
    VerifyMessage,
  },
};
</script>
