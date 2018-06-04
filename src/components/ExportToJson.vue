<template lang="html">
  <div class="export-json">
    <form>
      <div class="field">
        <label class="label" for="jsonKeystorePassword">Choose a password
          to encrypt your wallet file</label>
        <div class="control">
          <input
            v-model="password"
            type="password"
            name="password"
            v-validate="'required|min:8'"
            class="input"
            aria-describedby="password"
            placeholder="JSON keystore password"
            autocomplete="new-password">
        </div>
        <p class="help is-danger"
          v-if="errors.has('password')">{{errors.first('password')}}</p>
      </div>
      <a :class="{'is-loading' : exportingJson }" class="button is-primary is-medium" @click.prevent="exportJSON"
        :disabled="!isFormValid">Export</a>
    </form>
  </div>
</template>

<script>
import accounts from '@/mixins/accounts';

export default {
  data: () => ({
    password: '',
    exportingJson: false,
  }),
  computed: {
    isFormValid() {
      return !Object.keys(this.fields).some(
        field => this.fields[field] && this.fields[field].invalid
      );
    },
  },
  methods: {
    exportJSON() {
      if (this.activeAccount) {
        this.exportingJson = true;
        this.runExportJsonWorker()
          .then(this.saveJSON)
          .catch(this.exportError);
      }
    },
    runExportJsonWorker() {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          try {
            const jsonString = this.activeAccount.toV3String(this.password);
            resolve(jsonString);
          } catch (e) {
            reject(e);
          }
        }, 20);
      });
    },
    saveJSON(data) {
      const filename = `endpass_wallet_${this.address}.json`;
      const blob = new Blob([data], { type: 'text/json' });
      const e = document.createEvent('MouseEvents');
      const a = document.createElement('a');

      a.download = filename;
      a.href = window.URL.createObjectURL(blob);
      a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');
      e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
      a.dispatchEvent(e);
      a.remove();
      this.exportingJson = false;
    },
    exportError(e) {
      this.exportingJson = false;
      this.$notify({
        title: 'Error exporting to JSON',
        text: 'Could not create file with your wallet. Please try again.',
        type: 'is-danger',
      });
      console.error(e);
    },
  },
  mixins: [accounts],
};
</script>

<style lang="scss">
</style>
