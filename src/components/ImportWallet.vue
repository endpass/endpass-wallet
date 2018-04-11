<template>
  <div class="new-wallet">
    <div class="section">
      <div class="container">
        <div class="column is-one-quarter-desktop">
          <h1 class="title">Import Wallet</h1>
          <form>
            <div class="field">
              <label class="label" for="privateKey">Private key</label>
              <div class="control">
                <input type="text" class="input" id="privateKey" aria-describedby="privateKey" placeholder="Private key">
              </div>
            </div>
            <button class="button is-primary">Add</button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
    }
  }
}
</script>
