<template lang="html">
  <div class="new-account-modal">
    <v-modal @close="close">
      <template slot="header">Add custom token</template>

      <div v-if="!addedToken">
        <v-form id="addToken">

          <v-input v-model="token.address"
                   label="Address"
                   name="address"
                   v-validate="'required|address'"
                   id="address"
                   aria-describedby="address"
                   placeholder="Contract address"
                   :disabled="loadingToken"
                   required />
         <v-input v-if="notFound.decimals" v-model.number="token.decimals"
                  label="Decimals"
                  name="decimals"
                  v-validate="'required'"
                  id="decimals"
                  aria-describedby="decimal"
                  placeholder="Token decimals"
                  :disabled="!notFound.decimals"
                  required />
        <v-input v-if="notFound.name" v-model="token.name"
                 label="Name"
                 name="name"
                 v-validate="'required'"
                 id="name"
                 aria-describedby="name"
                 placeholder="Token name"
                 :disabled="!notFound.name"
                 required />
         <v-input v-if="notFound.symbol" v-model="token.symbol"
                  label="Symbol"
                  name="symbol"
                  v-validate="'required'"
                  id="symbol"
                  aria-describedby="symbol"
                  placeholder="Token symbol"
                  :disabled="!notFound.symbol"
                  required />
        </v-form>
      </div>
      <div v-else>
        <p class="subtitle">New token added</p>
        <div class="message">
          <div class="message-header">
            <p>{{token.name}} ({{token.symbol}})</p>
          </div>
          <div class="message-body">
            <p class="code address">{{token.address}}</p>
          </div>
        </div>
      </div>

      <div slot="footer">
        <div v-if="!addedToken">
          <div class="is-pulled-left">
            <v-button v-if="!loadedToken" @click.prevent="createToken"
                      className="is-primary"
                      :loading="loadingToken"
                      :disabled="this.errors.has('address')">Find</v-button>
            <v-button v-else @click.prevent="addToken(token)"
                      className="is-primary"
                      :disabled="!isFormValid">Add</v-button>
          </div>
          <div class="is-pulled-right">
            <a class="button" @click="close" :disabled="!loadedToken">Cancel</a>
          </div>
        </div>
        <div v-else>
          <a class="button is-pulled-left is-primary" @click="addMore()">Add more</a>
          <a class="button is-pulled-right" @click="close">Close</a>
        </div>
      </div>

    </v-modal>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import erc20ABI from '@/erc20.json';
import VModal from '@/components/ui/VModal';
import VForm from '@/components/ui/form/VForm.vue';
import VInput from '@/components/ui/form/VInput.vue';
import VButton from '@/components/ui/form/VButton.vue';

export default {
  data () {
    return {
      loadedToken:false,
      addedToken: false,
      loadingToken: false,
      foundToken: false,
      formValid: false,
      token: {
        addres: '',
        symbol: '',
        name: '',
        decimals: ''
      },
      notFound: {
        decimals: false,
        name: false,
        symbol: false
      }
    }
  },
  computed: {
    ...mapState({
      web3: state => state.web3.web3,
      address: state => state.accounts.activeAccount.getAddressString()
    }),
    isFormValid() {
      const hasInvalidField = Object.keys(this.fields).some(
        field => this.fields[field] && this.fields[field].invalid
      );

      return !(hasInvalidField || this.errors.count());
    }
  },
  methods: {
    ...mapActions('tokens', ['addTokenToSubscription']),
    addMore() {
      this.token = {
        addres: '',
        symbol: '',
        name: '',
        decimals: ''
      };
      this.notFound = {
        decimals: false,
        name: false,
        symbol: false
      };
      this.addedToken = false;
    },
    addToken() {
      this.addTokenToSubscription(this.token);
      this.loadingToken = false;
      this.addedToken = true;
    },
    createToken() {
      this.loadingToken = true;
      let contract = new this.web3.eth.Contract(erc20ABI, this.token.address);
      this.checkContractExistence(contract).then(() => {
        this.getTokenData(contract).then(() => {
          if(!(this.notFound.decimals || this.notFound.symbol || this.notFound.name)) {
            this.addToken(this.token);
          } else {
            this.loadingToken = false;
            this.loadedToken = true;
          }
        })
      }).catch(e => {
        this.loadingToken = false;
        this.$notify({
          title: 'Not a valid erc20 token',
          text: 'Please ensure token matches standard, and check address.',
          type: 'is-warning',
        });
        console.error(e);
      })
    },
    checkContractExistence(contract) {
      return contract.methods.balanceOf(this.address).call()
    },
    getTokenData(contract) {
      let tryToGetNamePromise = new Promise((res, rej) => {
        contract.methods.name().call().then((resp) => {
          res(resp);
        }).catch((e) => {
          res(false);
        });
      });
      let tryToGetDecimalsPromise = new Promise((res, rej) => {
        contract.methods.decimals().call().then((resp) => {
          res(resp);
        }).catch((e) => {
          res(false);
        });
      });
      let tryToGetSymbolPromise = new Promise((res, rej) => {
        contract.methods.symbol().call().then((resp) => {
          res(resp);
        }).catch((e) => {
          res(false);
        });
      });
      return Promise.all([tryToGetNamePromise, tryToGetDecimalsPromise, tryToGetSymbolPromise]).then((arr) => {
        if(arr[0]) {
          this.token.name = arr[0]
        } else {
          this.notFound.name = true;
        }
        if(arr[1]) {
          this.token.decimals = arr[1]
        } else {
          this.notFound.decimals = true;
        }
        if(arr[2]) {
          this.token.symbol = arr[2]
        } else {
          this.notFound.symbol = true;
        }
        this.loadingToken = false;
      });
    },
    close() {
      this.$emit('close')
    }
  },
  components: {
    VModal,
    VForm,
    VInput,
    VButton
  }
}
</script>

<style lang="scss">
</style>
