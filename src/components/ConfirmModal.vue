<template>
  <!-- Modal -->
  <div ref="modal" class="modal fade" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="newPwModalLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <form @submit.prevent="handleSave">
          <div class="modal-header">
            <h1 class="modal-title fs-5">Warning</h1>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click="hide"></button>
          </div>
          <div class="modal-body">
            <p class="mb-0 text-center">{{ this.confirmMessage }}</p>
          </div>
          <div class="modal-footer">
            <button type="submit" class="btn btn-danger flex-grow-1" @click="handleExecute">Confirm</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ConfirmModal',
  props: {
    confirmMessage: {
      type: String,
      default: 'Do you really want to execute it?'
    },
  },
  data() {
    return {
      isVisible: false, // モーダルの表示状態
    };
  },
  methods: {
    show() {
      this.isVisible = true; // モーダルを表示
    },
    hide() {
      this.isVisible = false; // モーダルを非表示
    },
    handleExecute() {
      this.$emit('next');

      // モーダルを非表示
      this.hide();
    }
  },
  watch: {
    isVisible(newVal) {
      if (newVal) {
        this.modal.show(); // isVisible が true になったらモーダルを表示
      } else {
        this.modal.hide(); // isVisible が false になったらモーダルを非表示
      }
    }
  },
  mounted() {
    this.modal = new bootstrap.Modal(this.$refs.modal); // モーダルインスタンスの作成
  },
}
</script>