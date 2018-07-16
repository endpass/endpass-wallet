<template>
  <div class="import-wallet app-page">
    <div class="section">
      <div class="container">
        <div class="card app-card">
          <div class="card-header">
            <h1 class="card-header-title">Import Existing Wallet</h1>
          </div>
          <div class="card-content">
            <a @click="$router.go(-1)">&lt; Back</a>
            <p class="subtitle">Select the type of wallet you would like to
            import.</p>
            <div class="columns">

              <div class="column is-one-third">
                <v-list v-model="importType"
                        label="Import Type"
                        :list="menu"/>
              </div>

              <div class="column">
                <div class="import-wallet">
                  <component :is="importComponent"></component>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import VList from '@/components/ui/VList.vue';
import ImportFromSeed from '@/components/importWallet/ImportFromSeed';
import ImportFromPrivateKey from '@/components/importWallet/ImportFromPrivateKey';
import ImportFromPublicKey from '@/components/importWallet/ImportFromPublicKey';
import ImportFromJson from '@/components/importWallet/ImportFromJson';

export default {
  data: () => ({
    importType: 'seedPhrase',
    menu: {
      seedPhrase: 'Seed Phrase',
      privateKey: 'Private Key',
      json: 'V3 JSON keystore',
      address: 'Address (view only)',
    },
  }),
  computed: {
    importComponent() {
      switch (this.importType) {
        case 'privateKey':
          return 'ImportFromPrivateKey';

        case 'json':
          return 'ImportFromJson';

        case 'address':
          return 'ImportFromPublicKey';

        default:
          return 'ImportFromSeed';
      }
    },
  },
  components: {
    VList,
    ImportFromSeed,
    ImportFromPrivateKey,
    ImportFromPublicKey,
    ImportFromJson,
  },
};
</script>

<style lang="scss">
.menu-list {
  a.is-active {
    background-color: $purple;
  }
}
</style>
