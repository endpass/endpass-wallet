<template lang="html">
  <div class="modal is-active">
    <div class="modal-background" @click="close"></div>
    <div class="modal-card">
      <div class="modal-card-head">
        <h3 class="modal-card-title">
          <slot name="header"></slot>
        </h3>
        <button class="delete is-large" @click="close"></button>
      </div>
      <div class="modal-card-body">
        <slot></slot>
      </div>
      <div class="modal-card-foot">
        <slot name="footer"></slot>
      </div>
    </div>
  </div>
</template>

<script>
// Generic modal component to be used with slots
export default {
  name: 'v-modal',
  inject: ['$validator'],
  methods: {
    close() {
      this.$emit('close');
    },
  },
};
</script>

<style lang="scss">
.modal {
  .modal-card {
    .modal-card-head {
      background-color: $purple;
      border-bottom: none;
    }
    .modal-card-title {
      color: $white;
    }
    .modal-card-foot {
      padding: 0;
      //border-radius: 0;
      // Full width buttons
      .buttons {
        flex: 1;

        .button {
          &:not(:last-child) {
            margin-right: 0;
          }
        }
      }
    }
  }
}
</style>
