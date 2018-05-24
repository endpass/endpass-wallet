<template lang="html">
  <div class="export-json">
    <form>
      <div class="field">
        <label class="label" for="jsonKeystorePassword">Choose a password
          to encrypt your wallet file</label>
        <div class="control">
          <input v-model="password" type="password" class="input"
          placeholder="JSON keystore password" autocomplete="new-password">
        </div>
      </div>
      <a :class="{'is-loading' : exportingJson }" class="button is-primary is-medium" @click.prevent="exportJSON"
        :disabled="!password">Export</a>
    </form>
  </div>
</template>

<script>
import accounts from '@/mixins/accounts'

export default {
  data() {
    return {
      password: '',
      exportingJson: false
    }
  },
  methods: {
    exportJSON() {
      if(this.activeAccount) {
        this.exportingJson = true;
        this.runExportJsonWorker()
        .then(this.saveJSON)
        .catch(this.exportError)
      }
    },
    runExportJsonWorker() {
      return new Promise((resolve, reject) => {
        setTimeout(()=>{
          try {
            let jsonString = this.activeAccount.toV3String(this.password);
            resolve(jsonString)
          } catch (e) {
            reject(e);
          }
        },20)
      })
    },
    saveJSON(data){
      let filename = `endpass_wallet_${this.address}.json`
      let blob = new Blob([data], {type: 'text/json'}),
          e    = document.createEvent('MouseEvents'),
          a    = document.createElement('a');

      a.download = filename;
      a.href = window.URL.createObjectURL(blob)
      a.dataset.downloadurl =  ['text/json', a.download, a.href].join(':')
      e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
      a.dispatchEvent(e)
      a.remove();
      this.exportingJson = false;
    },
    exportError(e) {
      this.exportingJson = false;
      console.error(e)
    }
  },
  mixins: [accounts]
}
</script>

<style lang="scss">
</style>
