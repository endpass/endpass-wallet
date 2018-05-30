<template>
  <div class="app-nav navbar">
    <div class="navbar-brand">
      <router-link class="navbar-item logo-icon" to="/">
        <img src="@/img/logo-light.png" alt="Endpass Wallet">
      </router-link>
      <a class="navbar-burger" @click="toggleNavMenu" :class="{'is-active':navMenuActive}">
        <span></span>
        <span></span>
        <span></span>
      </a>
    </div>
    <div class="navbar-menu" :class="{'is-active':navMenuActive}">
      <div class="navbar-start">
        <router-link class="navbar-item" to="/" @click.native="toggleNavMenu">
          <span class="icon is-small"
                v-html="require('@/img/home.svg')"></span>Dashboard
        </router-link>
        <router-link v-if="activeAccount" class="navbar-item" :to="{name: 'HistoryPage'}" @click.native="toggleNavMenu">
          <span class="icon is-small"
                v-html="require('@/img/clock.svg')"></span>History
        </router-link>
        <router-link v-if="activeAccount && isPrivateKey" class="navbar-item" :to="{name: 'SendPage'}" @click.native="toggleNavMenu">
          <span class="icon is-small"
                v-html="require('@/img/arrow-thick-left.svg')"></span>Send
        </router-link>
        <router-link v-if="activeAccount" class="navbar-item" :to="{name:
        'ReceivePage'}" @click.native="toggleNavMenu">
          <span class="icon is-small"
                v-html="require('@/img/arrow-thick-right.svg')"></span>Receive
        </router-link>
        <router-link v-if="activeAccount" class="navbar-item" :to="{name:
        'TokensPage'}" @click.native="toggleNavMenu">
          <span class="icon is-small"
                v-html="require('@/img/compass.svg')"></span>Tokens
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      navMenuActive: false
    }
  },
  computed: {
    isPrivateKey() {
      return this.$store.state.accounts.activeAccount && this.$store.state.accounts.activeAccount._privKey !== null
    }
  },
  methods: {
    toggleNavMenu () {
      this.navMenuActive = !this.navMenuActive
    }
  },
  props: {
    activeAccount: Boolean
  }
}
</script>

<style lang="scss">
// Navbar
.app-nav {
  .navbar-menu {
    a.navbar-item {
      font-family: $heading-font-family;
      font-size: 1.1rem;
      text-transform: uppercase;
    }
  }

  .navbar-burger {
    span {
      height: 3px;
    }
  }

  a.navbar-item.is-active, a.navbar-item:hover, a.navbar-link.is-active,
  a.navbar-link:hover, .router-link-exact-active {
    background-color: initial;
    color: $purple;

    .icon svg {
      fill: $purple;
    }
  }

  .navbar-item .icon:only-child, .navbar-link .icon:only-child {
    margin-left: 0;
    margin-right: 0.25em;
  }
}
</style>
