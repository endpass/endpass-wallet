<template lang="html">
  <div class="modal is-active">
    <div
      class="modal-background"
      @click="close"
    />
    <div class="modal-logo" />
    <div class="modal-card">
      <div class="modal-card-head">
        <h3 class="modal-card-title">
          <slot name="header" />
        </h3>
        <button
          class="delete is-large"
          @click="close" />
      </div>
      <div class="modal-card-body">
        <slot />
      </div>
      <div class="modal-card-foot">
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>

<script>
// Generic modal component to be used with slots
export default {
  name: 'VModal',
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
      background-color: $white;
      padding: 2rem 1rem;
      text-align: center;
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
    &:hover,
    &.is-hoevered {
      background-color: lighten($purple, 5%);
      transition: background-color 0.2s ease-in;
    }
  }

  .modal-logo {
    position: absolute;
    top: 1rem;
    left: 1rem;
    width: 240px;
    height: 80px;
    background-size: cover;
    background-image: url('/static/logo-dark.png');
  }
  @media screen and (max-width: 1023px) {
    .modal-logo {
      width: 144px;
      height: 48px;
    }
  }
}

.modal.is-naked {
  .modal-card {
    .modal-card-head,
    .modal-card-foot,
    .modal-card-body {
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
