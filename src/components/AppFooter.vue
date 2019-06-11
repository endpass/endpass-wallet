<template>
  <footer class="app-footer section is-narrow">
    <div class="container">
      <p class="small disclaimer">
        Endpass Wallet is non-custodial software for managing blockchain
        transactions. We never hold your funds. We never have access to your
        funds or private keys.
      </p>
      <div class="footer-links level is-mobile">
        <div class="level-left">
          <p class="level-item">
            &copy; 2018 Endpass, Inc
          </p>
          <p class="level-item">
            <a
              target="_blank"
              class="github-button"
              href="https://github.com/endpass/endpass-wallet"
            >
              <span
                class="icon is-small"
                v-html="require('@/img/github.svg')"
              />
              100% Open Source
            </a>
          </p>
          <p class="level-item">
            <a
              target="_blank"
              href="https://help.endpass.com"
            >
              Support
            </a>
          </p>
        </div>
        <div class="level-right" />
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'AppFooter',
};
</script>

<style lang="scss">
.app-footer {
  font-size: 0.85rem;
  color: $dark-grey;

  a {
    color: $dark-grey;

    &:hover {
      color: $primary;
    }
  }
  .icon {
    vertical-align: middle;
  }

  .disclaimer {
    margin-bottom: 0.5rem;
  }
}
</style>
