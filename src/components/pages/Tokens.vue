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
                  v-if="isLoading || trackedTokens.length"
                  class="panel"
                >
                  <div class="panel-block">
                    <search-input
                      v-model="search"
                      data-test="token-search-input"
                    />
                  </div>
                  <v-spinner
                    :is-loading="isLoading"
                    class="spinner-block"
                  />
                  <div class="scroller">
                    <tokens-list
                      :tokens="userTokensList"
                      :has-remove="true"
                      :item-class="'panel-block is-clearfix is-block'"
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
                  :options="searchTokensList"
                  :options-limit="10"
                  :show-labels="false"
                  track-by="address"
                  label="name"
                  placeholder="Type to search tokens..."
                  data-test="tokens-select"
                  @search-change="setSearchToken"
                  @select="saveTokenAndSubscribe({token: $event })"
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
import { mapState, mapActions, mapGetters } from 'vuex';
import Multiselect from 'vue-multiselect';
import Balance from '@/components/Balance';
import VToken from '@/components/VToken';
import TokensList from '@/components/TokensList';
import SearchInput from '@/components/SearchInput.vue';
import AddTokenModal from '@/components/modal/AddTokenModal';
import VSpinner from '@/components/ui/VSpinner';
import { matchString } from '@/utils/strings';

export default {
  name: 'TokensPage',
  data() {
    return {
      search: '',
      searchToken: '',
      addTokenModalOpen: false,
    };
  },
  computed: {
    ...mapState({
      prices: state => state.tokens.prices,
      allTokens: state => state.tokens.allTokens,
      // []string, list of tracked tokens addresses
      trackedTokens: state => state.tokens.trackedTokens,
      isLoading: state => state.tokens.isLoading,
      ethPrice: state => state.price.price,
      currency: state => state.user.settings.fiatCurrency,
    }),
    ...mapGetters('tokens', ['trackedTokensWithBalance']),

    // All tokens that are available to add
    // TODO convert all addresses to checksum in store
    filteredTokens() {
      return Object.values(this.allTokens).filter(token => {
        const address = token.address.toLowerCase();
        return !this.trackedTokens
          .map(addr => addr.toLowerCase())
          .includes(address);
      });
    },
    searchTokensList() {
      const { searchToken } = this;

      if (!searchToken) {
        return this.filteredTokens;
      }

      const search = searchToken.toLowerCase();

      return this.filteredTokens.filter(token => {
        const { name, symbol } = token;

        return (
          name.toLowerCase().includes(search) ||
          symbol.toLowerCase().includes(search)
        );
      });
    },
    userTokensList() {
      const { search, trackedTokensWithBalance } = this;

      return trackedTokensWithBalance.filter(
        ({ name, symbol }) =>
          matchString(name, search) || matchString(symbol, search),
      );
    },
  },
  methods: {
    ...mapActions('tokens', ['saveTokenAndSubscribe']),
    setSearchToken(query) {
      this.searchToken = query;
    },
    openAddTokenModal() {
      this.addTokenModalOpen = true;
    },
    closeAddTokenModal() {
      this.addTokenModalOpen = false;
    },
  },
  components: {
    SearchInput,
    Balance,
    AddTokenModal,
    Multiselect,
    VSpinner,
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
    height: 108px;
  }
}
</style>
