<template>
  <div class="app-page send-page">
    <div class="section">
      <div class="container is-narrow">
        <div class="card app-card main-app-card">
          <div class="card-header">
            <h1 class="card-header-title">Login/Register</h1>
          </div>
          <div class="card-content">
            <v-form id="login" v-if="!isSuccess">

              <v-input v-model="email"
                       label="Email"
                       name="email"
                       validator="required|email"
                       id="email"
                       aria-describedby="email"
                       placeholder="Your email"
                       :disabled="isSending"
                       required />

              <v-button @click.prevent="handleLogin"
                        id="send-button"
                        className="is-primary is-medium"
                        :loading="isSending">Send</v-button>

            </v-form>
            <p id="success-message"
               v-else>Click the link in your email to log in</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import VForm from '@/components/ui/form/VForm.vue';
import VInput from '@/components/ui/form/VInput.vue';
import VButton from '@/components/ui/form/VButton.vue';
import error from '@/mixins/error';

export default {
  data: () => ({
    email: '',
    isSending: false,
    isSuccess: false,
  }),
  methods: {
    ...mapActions('accounts', ['login']),
    handleLogin() {
      this.isSending = true;
      this.login(this.email)
        .then(() => {
          this.isSending = false;
          this.isSuccess = true;
          this.$notify({
            title: 'Success',
            text: 'Click the link in your email to log in',
            type: 'is-info',
          })
        })
        .catch(e => {
          this.isSending = false;
          this.emitError(e);
        });
    }
  },
  components: {
    VForm,
    VButton,
    VInput,
  },
  mixins: [error],
};
</script>