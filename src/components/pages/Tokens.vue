<template lang="html">
  <div class="tokens-page">
    <div class="section">
      <div class="container">
        <div class="columns is-reverse-mobile">
          <div class="column is-half">
            <div class="card app-card">
              <div class="card-header">
                <p class="card-header-title">Your Tokens</p>
              </div>
              <div class="card-content is-narrow">
                <nav
                  v-if="isUserHasTokens"
                  class="panel"
                >
                  <div class="panel-block">
                    <search-input
                      v-model="userTokenQuery"
                      data-test="token-search-input"
                    />
                  </div>
                  <v-spinner
                    v-if="isLoading || isProcessingToken"
                    class="spinner-block"
                    data-test="tokens-spinner"
                  />
                  <div class="scroller">
                    <tokens-list
                      :tokens="userTokensList"
                      :has-remove="true"
                      :item-class="'panel-block is-clearfix is-block'"
                      data-test="tokens-list"
                    />
                  </div>
                </nav>
                <p
                  v-else
                  class="small"
                  data-test="no-tokens-text"
                >
                  You have no tokens on this network. Add some!
                </p>
              </div>
            </div>
          </div>
          <div class="column is-half">
            <div class="card">
              <div class="card-header">
                <div class="card-header-title">
                  Add Token
                </div>
                <div class="card-header-icon">
                  <a
                    class="button is-outlined is-info is-small"
                    data-test="add-custom-token-button"
                    @click.prevent="openAddTokenModal()"
                  >
                    Add Custom Token
                  </a>
                </div>
              </div>
              <div class="card-content">
                <multiselect
                  :allow-empty="false"
                  :internal-search="false"
                  :options="filteredTokens"
                  :options-limit="10"
                  :show-labels="false"
                  track-by="address"
                  label="name"
                  placeholder="Type to search tokens..."
                  data-test="tokens-select"
                  @search-change="setNetworkTokenQuery"
                  @select="addToken"
                >
                  <span
                    slot="option"
                    slot-scope="props"
                    class="multiselect-option"
                  >
                    <v-token :token="props.option" />
                  </span>
                </multiselect>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
    <add-token-modal
      v-if="addTokenModalOpen"
      @close="closeAddTokenModal"
    />
  </div>
</template>

<script>
import { isEmpty } from 'lodash';
import { mapState, mapActions, mapGetters } from 'vuex';
import Multiselect from 'vue-multiselect';
import Balance from '@/components/Balance';
import VToken from '@/components/VToken';
import TokensList from '@/components/TokensList';
import SearchInput from '@/components/SearchInput.vue';
import AddTokenModal from '@/components/modal/AddTokenModal';
import { matchString } from '@endpass/utils/strings';
import { MAIN_NET_ID } from '@/constants';

export default {
  name: 'TokensPage',

  data: () => ({
    userTokenQuery: '',
    networkTokenQuery: '',
    addTokenModalOpen: false,
    isProcessingToken: false,
  }),

  computed: {
    ...mapState({
      prices: state => state.tokens.prices,
      allTokens: state => state.tokens.allTokens,
      networkTokens: state => state.tokens.networkTokens,
      activeNetId: state => state.web3.activeNet.id,
      // []string, list of tracked tokens addresses
      isLoading: state => state.tokens.isLoading,
      ethPrice: state => state.price.price,
      currency: state => state.user.settings.fiatCurrency,
    }),
    ...mapGetters('tokens', ['allCurrentAccountFullTokens']),

    isUserHasTokens() {
      return !isEmpty(this.allCurrentAccountFullTokens);
    },

    // All tokens that are available to add
    // TODO convert all addresses to checksum in store
    filteredTokens() {
      const {
        networkTokens,
        allCurrentAccountFullTokens,
        networkTokenQuery,
      } = this;

      if (this.activeNetId !== MAIN_NET_ID) {
        return [];
      }

      return Object.values(networkTokens).filter(token => {
        const isUserHasToken = Object.keys(
          allCurrentAccountFullTokens,
        ).includes(token.address);
        const isTokenMatchesToSearch = this.matchTokenToQuery(
          token,
          networkTokenQuery,
        );

        return !isUserHasToken && isTokenMatchesToSearch;
      });
    },

    userTokensList() {
      const { userTokenQuery, allCurrentAccountFullTokens } = this;

      return Object.values(allCurrentAccountFullTokens).filter(token =>
        this.matchTokenToQuery(token, userTokenQuery),
      );
    },
  },

  methods: {
    ...mapActions('tokens', ['addUserToken']),

    matchTokenToQuery(token, query) {
      return matchString(token.name, query) || matchString(token.symbol, query);
    },

    setNetworkTokenQuery(query) {
      this.networkTokenQuery = query;
    },

    openAddTokenModal() {
      this.addTokenModalOpen = true;
    },

    closeAddTokenModal() {
      this.addTokenModalOpen = false;
    },

    async addToken(token) {
      // TODO: add loader when adding start and make network tokens select disabled
      await this.addUserToken({ token });
    },
  },

  components: {
    SearchInput,
    Balance,
    AddTokenModal,
    Multiselect,
    VToken,
    TokensList,
  },
};
</script>

<style lang="scss">
@import 'vue-multiselect/dist/vue-multiselect.min.css';
.scroller {
  max-height: 500px;
  overflow-y: auto;
}

.panel {
  .panel-heading {
    background-color: $primary;
    &:first-child {
      border-top: none;
    }
    border: none;
    border-radius: 0;

    color: $white;
    font-weight: 600;
    text-transform: uppercase;
  }

  .panel-block {
    &:first-child {
      border-top: none;
    }

    .field {
      &.is-expanded {
        flex-grow: 1;
      }
    }
  }
}

.token-symbol {
  font-weight: 600;
}

.tokens-page {
  .spinner-block {
    height: 100%;
  }
}
</style>
