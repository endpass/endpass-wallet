<template lang="html">
  <v-modal @close="close">
    <template slot="header">Two Factor Authentication via OTP</template>

    <v-form @submit="confirm">
      <div class="field" v-if="secret && email">
        <div class="has-text-centered">
          <img :src="qrCodeSrc" />
        </div>
        <label class="label">Secret</label>
        {{secret}}
      </div>
      <v-input v-model="code"
               label="Verification Code"
               name="verificationCode"
               validator="required"/>
      <v-button className="is-primary is-medium" :loading="isLoading">Verify</v-button>
    </v-form>
  </v-modal>
</template>

<script>
import VModal from '@/components/ui/VModal';
import VForm from '@/components/ui/form/VForm';
import VInput from '@/components/ui/form/VInput';
import VButton from '@/components/ui/form/VButton';

export default {
  name: 'two-factor-auth-modal',
  data() {
    return {
      code: null,
    };
  },
  computed: {
    qrCodeSrc() {
      const otpAuthUri = `otpauth://totp/Endpass:${this.email}?secret=${
        this.secret
      }`;

      return `https://chart.googleapis.com/chart?chs=166x166&chld=L|0&cht=qr&chl=${otpAuthUri}`;
    },
  },
  props: {
    secret: String,
    email: String,
    isLoading: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    confirm() {
      this.$emit('confirm', this.code);
    },
    close() {
      this.$emit('close');
    },
  },
  components: {
    VModal,
    VForm,
    VInput,
    VButton,
  },
};
</script>
