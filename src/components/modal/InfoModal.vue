<template lang="html">
  <div
    class="info-modal"
    data-test="info-modal"
  >
    <v-modal @close="handleCancel">
      <template slot="header">
        {{ title }}
      </template>

      <div>
        <div class="message is-success">
          <div
            v-if="subTitle"
            class="message-header"
          >
            <p>
              {{ subTitle }}
            </p>
          </div>
          <div class="message-body">
            <slot />
          </div>
        </div>
      </div>

      <div
        slot="footer"
        class="buttons"
      >
        <v-button
          class-name="is-primary is-medium"
          @click="handleCancel"
        >
          Close
        </v-button>
      </div>
    </v-modal>
  </div>
</template>

<script>
export default {
  name: 'InfoModal',

  props: {
    title: {
      type: String,
      default: null,
    },

    subTitle: {
      type: String,
      default: null,
    },

    isSuccess: {
      type: Boolean,
      default: false,
    },
  },

  methods: {
    handleCancel() {
      this.$emit('close');
    },
  },
};
</script>

<style lang="scss">
.passsword-modal {
}
</style>
