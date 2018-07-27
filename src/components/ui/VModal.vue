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

.modal.is-dark {
  .modal-background {
    background-color: $purple;
  }

  .modal-card {
    .modal-card-head {
      background-color: white;
      border-bottom: 1px solid $purple;
      color: $purple;
    }

    .modal-card-title {
      color: $purple;
    }
  }

  .delete {
    background-color: $purple;
    &:hover,&.is-hoevered {
      background-color: lighten($purple, 5%);
      transition: background-color .2s ease-in;
    }
  }
}

.modal.is-naked {
  .modal-card {
    .modal-card-head, .modal-card-foot, .modal-card-body {
      background-color: transparent;
      color: $white;
    }
    .modal-card-title {
      color: $white;
    }

    .modal-card-body {
      .label {
        color: $white;
      }
    }
  }
  .delete {
    background-color: transparent;
  }
}
</style>
