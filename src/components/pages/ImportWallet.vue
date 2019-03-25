<template>
  <base-page class="import-wallet">
    <template
      slot="title"
    >Import Existing Wallet</template>
    <p class="subtitle">Select the type of wallet you would like to import.</p>
    <div class="columns">
      <div class="column is-one-third">
        <v-list
          v-model="importType"
          :list="menu"
          label="Import Type"
        />
      </div>

      <div class="column has-spinner">
        <div class="import-wallet">
          <component :is="importComponent" />
        </div>
      </div>
    </div>
  </base-page>
</template>

<script>
import BasePage from '@/components/pages/Base';
import ImportFromSeed from '@/components/importWallet/ImportFromSeed';
import ImportFromPrivateKey from '@/components/importWallet/ImportFromPrivateKey';
import ImportFromPublicKey from '@/components/importWallet/ImportFromPublicKey';
import ImportFromJson from '@/components/importWallet/ImportFromJson';
import ImportFromHardware from '@/components/importWallet/ImportFromHardware';

export default {
  data: () => ({
    importType: 'seedPhrase',
    menu: {
      seedPhrase: 'Seed Phrase',
      privateKey: 'Private Key',
      json: 'V3 JSON keystore',
      address: 'Address (view only)',
      hardware: 'Hardware',
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

        case 'hardware':
          return 'ImportFromHardware';

        default:
          return 'ImportFromSeed';
      }
    },
  },
  components: {
    BasePage,
    ImportFromSeed,
    ImportFromPrivateKey,
    ImportFromPublicKey,
    ImportFromJson,
    ImportFromHardware,
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
