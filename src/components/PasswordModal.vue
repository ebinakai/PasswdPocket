<template>
  <!-- Modal -->
  <div ref="modal" class="modal fade" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="newPwModalLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <form @submit.prevent="handleSave">
          <div class="modal-header">
            <h1 class="modal-title fs-5">Edit Record</h1>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click="hide"></button>
          </div>
          <div class="modal-body">
            <div class="mb-4">
              <input type="text"
                    name="newService"
                    class="form-control"
                    :class="{ 'is-invalid': failedService }"
                    aria-labelledby="serviceHelpBlock"
                    placeholder="Service Name"
                    v-model="localService"
                    autocomplete="false">
            </div>
            <div class="mb-4">
              <input type="text"
                    name="newUsername"
                    class="form-control"
                    :class="{ 'is-invalid': failedUsername }"
                    aria-labelledby="usernameHelpBlock"
                    placeholder="Username"
                    v-model="localUsername"
                    autocomplete="false">
            </div>
            <div class="mb-4">
              <input type="password"
                    name="newPassword"
                    class="form-control"
                    :class="{ 'is-invalid': failedPassword }"
                    aria-labelledby="passwordHelpBlock"
                    placeholder="Password"
                    v-model="localPassword"
                    autocomplete="false">
            </div>
            <div>
              <input type="password"
                    name="newPasswordAgain"
                    class="form-control"
                    :class="{ 'is-invalid': failedPasswordAgain }"
                    aria-labelledby="passwordAgainHelpBlock"
                    placeholder="Password Again"
                    v-model="localPasswordAgain"
                    autocomplete="false">
            </div>
          </div>
          <div class="modal-footer">
            <button type="submit" class="btn btn-theme-3 flex-grow-1 w-100">Save</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PasswordModal',
  props: {
    newService: {
      type: String,
      default: '' // デフォルト値として空文字列を設定
    },
    newUsername: {
      type: String,
      default: ''
    },
    newPassword: {
      type: String,
      default: ''
    },
    newPasswordAgain: {
      type: String,
      default: ''
    },
  },
  data() {
    return {
      localService: this.newService,
      localUsername: this.newUsername,
      localPassword: this.newPassword,
      localPasswordAgain: this.newPasswordAgain,
      failedService: false,         // サービス名入力のバリデーション状態
      failedUsername: false,        // ユーザー名入力のバリデーション状態
      failedPassword: false,        // パスワード入力のバリデーション状態
      failedPasswordAgain: false,   // パスワード確認入力のバリデーション状態
      isVisible: false,             // モーダルの表示状態
    };
  },
  methods: {
    show() {
      this.isVisible = true; // モーダルを表示
    },
    hide() {
      this.isVisible = false; // モーダルを非表示
    },
    handleSave() {
      // バリデーションを実行
      this.failedService = this.localService.trim() === '';
      this.failedUsername = this.localUsername.trim() === '';
      this.failedPassword = this.localPassword.trim() === '';
      this.failedPasswordAgain = this.localPasswordAgain.trim() === '' || this.localPassword !== this.localPasswordAgain;

      // バリデーションエラーがなければ処理を実行
      if (!this.failedService && !this.failedUsername && !this.failedPassword && !this.failedPasswordAgain) {
        this.$emit('next', {
          service: this.localService,
          username: this.localUsername,
          password: this.localPassword,
        });

        // 入力値をクリア
        this.hide();
        this.localService = '';
        this.localUsername = '';
        this.localPassword = '';
        this.localPasswordAgain = '';
      }
    }
  },
  watch: {
    newService(newVal) {
      this.localService = newVal;       // newService プロップの変更を監視
    },
    newUsername(newVal) {
      this.localUsername = newVal;      // newUsername プロップの変更を監視
    },
    newPassword(newVal) {
      this.localPassword = newVal;      // newPassword プロップの変更を監視
    },
    newPasswordAgain(newVal) {
      this.localPasswordAgain = newVal; // newPasswordAgain プロップの変更を監視
    },
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