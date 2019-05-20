<template>
  <base-page>
    <template slot="title">
      Transaction
    </template>
    <div class="tabs">
      <ul>
        <li
          v-for="tab in tabs"
          :key="tab.id"
          :class="{ 'is-active': isTabActive(tab.id) }"
        >
          <a
            role="button"
            @click="switchTab(tab.id)"
          >
            {{ tab.label }}
          </a>
        </li>
      </ul>
    </div>
    <sign-transaction v-show="currentTab === 'sign'" />
    <recover-transaction v-show="currentTab === 'recover'" />
  </base-page>
</template>

<script>
import BasePage from '@/components/pages/Base';
import SignTransaction from '@/components/SignTransaction';
import RecoverTransaction from '@/components/RecoverTransaction';
import privatePage from '@/mixins/privatePage';

export default {
  name: 'TransactionPage',

  data: () => ({
    currentTab: 'sign',
    tabs: [
      {
        label: 'Sign',
        id: 'sign',
      },
      {
        label: 'Recover',
        id: 'recover',
      },
    ],
  }),

  methods: {
    switchTab(tab) {
      this.currentTab = tab;
    },

    isTabActive(tab) {
      return this.currentTab === tab;
    },
  },

  mixins: [privatePage],

  components: {
    BasePage,
    SignTransaction,
    RecoverTransaction,
  },
};
</script>
