<template>
  <base-page class="import-wallet">
    <template slot="title">Import Existing Wallet</template>
    <p class="subtitle">Select the type of wallet you would like to
    import.</p>
    <div class="columns">

      <div class="column is-one-third">
        <v-list
          v-model="importType"
          :list="menu"
          label="Import Type"
        />
      </div>

      <div class="column">
        <div class="import-wallet">
          <component :is="importComponent" />
        </div>
      </div>

    </div>
  </base-page>
</template>

<script>
import BasePage from '@/components/pages/Base';
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
    BasePage,
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
