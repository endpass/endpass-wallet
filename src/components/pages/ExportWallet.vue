<template>
  <base-page class="export-wallet">
    <template slot="title">Export Wallet</template>
    <p class="subtitle">Exporting account <strong>{{address}}</strong></p>
    <div class="columns">

      <div class="column is-one-third">
        <div class="menu">
          <p class="menu-label">Export Type</p>
          <ul class="menu-list">
            <li>
              <a @click="exportType = 'privateKey'"
                :class="{'is-active':exportType==='privateKey'}">Private
                Key</a>
            </li>
            <li>
              <a @click="exportType = 'seedPhrase'"
                :class="{'is-active':exportType==='seedPhrase'}">Seed Phrase</a>
            </li>
            <li>
              <a @click="exportType = 'json'"
                :class="{'is-active':exportType==='json'}">JSON
                Keystore</a>
            </li>
          </ul>
        </div>
      </div>

      <div class="column">
        <div v-if="exportType==='privateKey'">
          <export-to-private-key/>
        </div>
        <div v-else-if="exportType==='json'">
          <export-to-json/>
        </div>
        <div v-else>
          <p class="subtitle">This export type is not supported on
            this device.</p>
        </div>
      </div>

    </div>
  </base-page>
</template>

<script>
import BasePage from '@/components/pages/Base';
import ExportToJson from '@/components/ExportToJson.vue';
import ExportToPrivateKey from '@/components/ExportToPrivateKey.vue';
import { mapState } from 'vuex';

export default {
  data() {
    return {
      exportType: 'privateKey',
    };
  },
  computed: {
    ...mapState({
      address: state =>
        state.accounts.address && state.accounts.address.getAddressString(),
    }),
  },
  components: {
    BasePage,
    ExportToJson,
    ExportToPrivateKey,
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
