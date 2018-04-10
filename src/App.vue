<template>
  <div id="app">
    <img src="./assets/logo.png">
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style lang="scss">
a {
  color: $purple;
  &:hover {
    color: darken($purple, 15%);
  }
}

h1,h2,h3,h4,h5,h6
{
        font-family: $heading-font-family;
}

</style>
