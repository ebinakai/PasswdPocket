<template>
  <!-- Modal -->
  <div ref="modal" class="modal fade" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="newPwModalLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <form @submit.prevent="handleSave">
          <div class="modal-header">
            <h1 class="modal-title fs-5">{{ modalTitle }}</h1>
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
            <div class="position-relative">
              <input type="text"
                    name="newPassword"
                    class="form-control pe-5"
                    :class="{ 'is-invalid': failedPassword }"
                    aria-labelledby="passwordHelpBlock"
                    placeholder="Password"
                    v-model="localPassword"
                    autocomplete="false">
              <button type="button" class="btn btn-icon btn-genpass position-absolute" @click="handleGenerateStrongPassword">
                <span class="material-symbols-outlined" :class="{ 'rotate': isAnimating }">replay</span>
              </button>
            </div>
            <div class="d-flex justify-content-between pt-3 mx-3 flex-wrap">
              <label><input v-model="passwordRules.uppercase" type="checkbox" class="me-1 form-check-input">Upper Case</label>
              <label><input v-model="passwordRules.lowercase" type="checkbox" class="me-1 form-check-input">Lower Case</label>
              <label><input v-model="passwordRules.numbers" type="checkbox" class="me-1 form-check-input">Numbers</label>
              <label><input v-model="passwordRules.symbols" type="checkbox" class="me-1 form-check-input">Symbols</label>
            </div>
            <div class="d-flex align-items-center pt-3">
              <label class="me-3">Length:</label>
              <input type="range" class="form-range flex-grow-1 mt-1" min="4" max="30" v-model="passwordLength">
              <div class="fw-bold ps-3" style="width: 3rem;">
                {{ passwordLength }}
              </div>
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
    modalTitle: {
      type: String,
      default: 'new Record'
    },
  },
  data() {
    return {
      localService: this.newService,
      localUsername: this.newUsername,
      localPassword: this.newPassword,
      failedService: false,         // サービス名入力のバリデーション状態
      failedUsername: false,        // ユーザー名入力のバリデーション状態
      failedPassword: false,        // パスワード入力のバリデーション状態
      isVisible: false,             // モーダルの表示状態
      passwordLength: 16,
      isAnimating: false, // ボタンの回転状態
      passwordRules: {
        uppercase: true,
        lowercase: true,
        numbers: true,
        symbols: false,
      }
    };
  },
  methods: {
    show() {
      this.isVisible = true; // モーダルを表示
      this.generateStrongPassword();
    },
    hide() {
      this.isVisible = false; // モーダルを非表示

      // 入力値をクリア
      this.localService = '';
      this.localUsername = '';
      this.localPassword = '';
      this.failedService = '';
      this.failedUsername = '';
      this.failedPassword = '';
    },
    handleSave() {
      // バリデーションを実行
      this.failedService = this.localService.trim() === '';
      this.failedUsername = this.localUsername.trim() === '';
      this.failedPassword = this.localPassword.trim() === '';

      // バリデーションエラーがなければ処理を実行
      if (!this.failedService && !this.failedUsername && !this.failedPassword) {
        this.$emit('next', {
          service: this.localService,
          username: this.localUsername,
          password: this.localPassword,
        });

        // 入力値をクリア
        this.hide();
      }
    },

    handleGenerateStrongPassword() {
      this.isAnimating = true; // アニメーションをトリガー
      
      // アニメーション終了後に状態をリセット（例: 1秒後）
      setTimeout(() => {
        this.isAnimating = false;
      }, 150);
      
      this.generateStrongPassword(); // 強力なパスワードを生成
    },

    // ランダムな強力なパスワードを生成
    // ======================================================================================================
    generateStrongPassword(alphaRatio = 0.6, numberRatio = 0.2) {
      const charset = {
        lowercase: 'abcdefghijklmnopqrstuvwxyz',
        uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        numbers: '0123456789',
        symbols: '!@#$%^&*'
      };

      // 各セットの文字数を計算
      const alphaCount = Math.round(this.passwordLength * alphaRatio);
      const numberCount = Math.round(this.passwordLength * numberRatio);
      const symbolCount = this.passwordLength - alphaCount - numberCount;

      // ランダムな文字を選択
      const randomChar = (category, count) => {
        let chars = '';
        for (let i = 0; i < count; i++) {
          chars += category[Math.floor(Math.random() * category.length)];
        }
        return chars;
      };

      // パスワード生成
      let password = '';
      password += randomChar(charset.lowercase + charset.uppercase, alphaCount); // アルファベット
      password += randomChar(charset.numbers, numberCount); // 数字
      password += randomChar(charset.symbols, symbolCount); // 記号

      // パスワードのシャッフル
      password = password.split('').sort(() => 0.5 - Math.random()).join('');
      // 生成されたパスワードを返す
      this.localPassword =  password;
    },
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
    isVisible(newVal) {
      if (newVal) {
        this.modal.show(); // isVisible が true になったらモーダルを表示
      } else {
        this.modal.hide(); // isVisible が false になったらモーダルを非表示
      }
    },
    passwordLength(newVal) {
      this.generateStrongPassword();
    },
    passwordRules: {
      handler() {
        this.generateStrongPassword();
      },
      deep: true
    }
  },
  mounted() {
    this.modal = new bootstrap.Modal(this.$refs.modal); // モーダルインスタンスの作成
  },
}
</script>

<style scoped>
.btn-genpass {
  top: 7px;
  right: 7px;
  height: auto;
  width: auto;
  padding: 0;
  border: none;
}
.is-invalid ~ .btn-genpass {
  right: 30px;
}

.btn-genpass .rotate {
  animation: Rotate 150ms ease-out;
}

@keyframes Rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(-360deg);
  }
}

input[type="range"]::-webkit-slider-runnable-track {
  background: var(--base-color-2); /* トラックの背景色 */
}

input[type="range"]::-moz-range-track {
  background: var(--base-color-2); /* トラックの背景色 */
}

/* スライダーのつまみ */
input[type="range"]::-webkit-slider-thumb {
  background: var(--theme-color-2); /* つまみの背景色 */
}

input[type="range"]::-moz-range-thumb {
  background: var(--theme-color-2); /* つまみの背景色 */
}
</style>