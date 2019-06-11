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
            v-if="description"
            class="message-header"
          >
            <p>
              {{ description }}
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

    description: {
      type: String,
      default: null,
    },
  },

  methods: {
    handleCancel() {
      this.$emit('close');
    },
  },
};
</script>
