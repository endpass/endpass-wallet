<template>
  <div id="app">
    <div class="navbar">
      <div class="navbar-brand">
        <router-link class="navbar-item" to="/">Endpass Wallet</router-link>
      </div>
      <div class="navbar-menu">
        <div class="navbar-start">
          <router-link class="navbar-item" :to="{name: 'SendPage'}">Send</router-link>
          <router-link class="navbar-item" :to="{name: 'ReceivePage'}">Receive</router-link>
        </div>

        <div class="navbar-end">
          <div class="navbar-item">
            <span>Current Account: </span>
            <span v-if="activeAccount">{{ activeAccount.getAddressString() }}</span>
            <router-link :to="{name: 'NewWallet'}" class="button is-primary" v-else>Create</router-link>
          </div>
          <div class="navbar-item">
            <span>Current Network</span>
            <div class="select">
              <select @change="selectNet" v-model="selectedNet">
                <option v-for="net in networks" :value="net.name">
                  {{net.name}}
                </option>
              </select>
            </div>
          </div>
        </div>

      </div>
    </div>

     <flash-message inline-template>
       <div class="notifications is-overlay">
         <transition-group name="fade" tag="div" class="container">
           <div v-for="(message, index) in storage" :key="index"
                class="notification" :class="'is-' + message.type" >
                <button class="delete"
                        @click.stop.prevent="destroyFlash(index)"></button>
                {{ message.content }}
           </div>
         </transition-group>
       </div>
     </flash-message>

    <keep-alive>
      <router-view/>
    </keep-alive>
  </div>
</template>

<script>

export default {
  name: 'App',
  data () {
    let cachedNet = localStorage.getItem('net');
    if(!cachedNet) {
      cachedNet = 'Main';
    }
    return {
      selectedNet: cachedNet
    };
  },
  computed: {
    activeAccount() {
      return this.$store.state.accounts.activeAccount;
    },
    networks() {
      return this.$store.state.web3.networks;
    },
    activeNet() {
      return this.$store.state.web3.activeNet;
    }
  },
  methods: {
    selectNet() {
      this.$store.commit('web3/changeNetwork', this.selectedNet);
      localStorage.setItem('net', this.selectedNet);
    }
  },
  created() {
    this.$store.commit('web3/changeNetwork', 'Main');
  }
}
</script>

<style lang="scss">
a {
  color: $purple;
  &:hover {
    color: darken($purple, 15%);
  }
}

h1,h2,h3,h4,h5,h6 {
    font-family: $heading-font-family;
}

.notifications {
  z-index: 1000;
}
.notification {
  &.is-error {
    background-color: #ff3860;
    color: #fff;
  }
}

// Transitions
%transition {
  transition: all 0.5s ease-in-out;
}

.fade-enter-active, .fade-leave-active {
  @extend %transition;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}

</style>
