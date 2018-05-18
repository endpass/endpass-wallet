<template lang="html">
  <form>
    <div class="field">
      <label class="label" for="jsonKeystorePassword">V3 JSON keystore password</label>
      <div class="control">
        <input v-model="password" type="password" class="input" id="jsonKeystorePassword"
        aria-describedby="jsonKeystorePassword" placeholder="V3 JSON keystore password">
      </div>
    </div>
    <button class="button is-primary is-medium" @click.prevent="exportJSON" :disabled="!password">Export</button>
  </form>
</template>

<script>
import accounts from '@/mixins/accounts'

export default {
  data() {
    return {
      password: ''
    }
  },
  methods: {
    exportJSON() {
      if(this.activeAccount) {
        let jsonString = this.activeAccount.toV3String(this.password);
        this.saveJSON(jsonString);
      }
    },
    saveJSON(data){
      let filename = `${this.address}.json`
      let blob = new Blob([data], {type: 'text/json'}),
          e    = document.createEvent('MouseEvents'),
          a    = document.createElement('a');

      a.download = filename;
      a.href = window.URL.createObjectURL(blob)
      a.dataset.downloadurl =  ['text/json', a.download, a.href].join(':')
      e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
      a.dispatchEvent(e)
      a.remove();
    }
  },
  mixins: [accounts]
}
</script>

<style lang="css">
</style>
