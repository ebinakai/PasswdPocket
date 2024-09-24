<template>
  <!-- Modal -->
  <div ref="modal" class="modal fade" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="newPwModalLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <form @submit.prevent="handleSave">
          <div class="modal-header">
            <h1 class="modal-title fs-5">{{ localModalTitle }}</h1>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click="hide"></button>
          </div>
          <div class="modal-body">
            <!-- サービス名入力欄 -->
            <div class="pb-2 border-bottom">
              <label for="service" class="form-label ms-2">Service</label>
              <div class="d-flex align-items-center">
                <input type="text"
                      name="newService"
                      class="form-control"
                      :class="{ 'is-invalid': failedService }"
                      aria-labelledby="serviceHelpBlock"
                      placeholder="Service Name"
                      v-model="localService"
                      autocomplete="false"
                      :disabled="!localIsEditable">
  
                <button class="btn btn-icon btn-outline-theme-4 ms-2" type="button" tabindex="-1" @click="copy(localService, 'service')">
                  <span class="material-symbols-outlined">{{ lastCopied === 'service' ? 'done' : 'content_copy' }}</span>
                </button>
              </div>
            </div>

            <!-- ユーザー名入力欄 -->
            <div class="pb-2 mt-1 border-bottom">
              <label for="username" class="form-label ms-2">Username</label>
              <div class="d-flex align-items-center">
                <input type="text"
                      name="newUsername"
                      class="form-control"
                      :class="{ 'is-invalid': failedUsername }"
                      aria-labelledby="usernameHelpBlock"
                      placeholder="Username"
                      v-model="localUsername"
                      autocomplete="false"
                      :disabled="!localIsEditable">
  
                <button class="btn btn-icon btn-outline-theme-4 ms-2" type="button" tabindex="-1" @click="copy(localUsername, 'username')">
                  <span class="material-symbols-outlined">{{ lastCopied === 'username' ? 'done' : 'content_copy' }}</span>
                </button>
              </div>
            </div>

            <!-- パスワード入力欄 -->
            <div class="pb-2 mt-1 border-bottom">
              <label for="password" class="form-label ms-2">Password</label>
              <div class="position-relative d-flex">
                <input type="text"
                      name="newPassword"
                      class="form-control pe-5"
                      :class="{ 'is-invalid': failedPassword }"
                      aria-labelledby="passwordHelpBlock"
                      placeholder="Password"
                      v-model="localPassword"
                      autocomplete="false"
                      :disabled="!localIsEditable">
                <button 
                  type="button" 
                  class="btn btn-icon btn-genpass position-absolute" 
                  tabindex="-1"
                  v-if="localIsEditable"
                  @click="handleGenerateStrongPassword">
                  <span class="material-symbols-outlined" :class="{ 'rotate': isAnimating }">replay</span>
                </button>
  
                <button class="btn btn-icon btn-outline-theme-4 ms-2" type="button" tabindex="-1" @click="copy(localPassword, 'password')">
                  <span class="material-symbols-outlined">{{ lastCopied === 'password' ? 'done' : 'content_copy' }}</span>
                </button>
              </div>

              <!-- パスワードジェネレータ -->
              <div v-if="localIsEditable">
                <div class="row ms-1">
                  <label class="col-6 mt-2"><input v-model="passwordRules.uppercase" type="checkbox" class="me-1 form-check-input" tabindex="-1">Upper Case</label>
                  <label class="col-6 mt-2"><input v-model="passwordRules.lowercase" type="checkbox" class="me-1 form-check-input" tabindex="-1">Lower Case</label>
                  <label class="col-6 mt-2"><input v-model="passwordRules.numbers" type="checkbox" class="me-1 form-check-input" tabindex="-1">Numbers</label>
                  <label class="col-6 mt-2"><input v-model="passwordRules.symbols" type="checkbox" class="me-1 form-check-input" tabindex="-1">Symbols</label>
                </div>
                <div class="d-flex align-items-center pt-3">
                  <label class="me-3">Length:</label>
                  <input type="range" class="form-range flex-grow-1 mt-1" min="4" max="30" v-model="passwordLength" tabindex="-1">
                  <div class="fw-bold ps-3" style="width: 3rem;">
                    {{ passwordLength }}
                  </div>
                </div>
              </div>
            </div>

            <!-- メモ欄 -->
            <div class="mt-1">
              <label for="note" class="form-label ms-2">Note</label>
              <div class="d-flex align-items-center">
                <textarea 
                    v-model="localNote" 
                    @input="adjustHeight" 
                    class="form-control autoresize"
                    :disabled="!localIsEditable"
                    placeholder="Note here...">
                </textarea>
                <button class="btn btn-icon btn-outline-theme-4 ms-2" type="button" tabindex="-1" @click="copy(localNote, 'note')">
                  <span class="material-symbols-outlined">{{ lastCopied === 'note' ? 'done' : 'content_copy' }}</span>
                </button>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button v-if="isInTrash" type="button" class="btn btn-outline-danger flex-grow-1 w-100" @click="handleRestore">Restore</button>
            <button v-else-if="localIsEditable" type="submit" class="btn btn-theme-3 flex-grow-1 w-100">Save</button>
            <template v-else>
              <button type="button" class="btn btn-theme-3 flex-grow-1 w-100" @click="handleEditable(true)">Edit</button>
              <button type="button" class="btn btn-outline-danger flex-grow-1 w-100" @click="handleDelete">Delete</button>
            </template>
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
    newEditablePassword: {
      type: Object,
      default: {
        id: '',
        service: '',
        username: '',
        password: '',
        note: '',
      }
    },
    newModalTitle: {
      type: String,
      default: 'new Record'
    },
    isEditable: {
      type: Boolean,
      default: true
    },
    isInTrash: {
      type: Boolean,
      default: false
    },
  },
  data() {
    return {
      localService: this.newEditablePassword.service,
      localUsername: this.newEditablePassword.username,
      localPassword: this.newEditablePassword.password,
      localNote: this.newEditablePassword.note,
      localModalTitle: this.newModalTitle,
      localIsEditable: this.isEditable,
      failedService: false,   // サービス名入力のバリデーション状態
      failedUsername: false,  // ユーザー名入力のバリデーション状態
      failedPassword: false,  // パスワード入力のバリデーション状態
      isVisible: false,       // モーダルの表示状態
      passwordLength: 16,     // パスワードのデフォルト長
      isAnimating: false,     // ボタンの回転状態
      lastCopied: '',         // 最終コピーの状態
      passwordRules: {
        uppercase: true,
        lowercase: true,
        numbers: true,
        symbols: false,
      }
    };
  },
  methods: {
    // クリップボードにコピー
    // ======================================================================================================
    copy(data, label) {
      if (navigator.clipboard) { // クリップボードAPIが利用可能かチェック
        navigator.clipboard.writeText(data).then(() => {
          this.lastCopied = label;
        }).catch(err => {
          console.error(err);
        });
      } else {
        console.error('クリップボードAPIがこのブラウザでは利用できません。');
      }
    },
    // モーダルの表示
    // ======================================================================================================
    show() {
      // パスワードが空の場合は強力なパスワードを生成
      if (this.localPassword === "") {
        this.generateStrongPassword();
      }

      // 編集可能状態が変更されたら処理を実行
      if (this.localIsEditable !== this.isEditable) {
        this.localIsEditable = this.isEditable;
        this.handleEditable(this.isEditable);
      }

      // モーダルを表示
      this.isVisible = true;
    },
    // モーダルを非表示
    // ======================================================================================================
    hide() {
      this.isVisible = false; // モーダルを非表示

      // コピー状態をリセット
      this.lastCopied = '';

      // 入力値をクリア
      this.localService = '';
      this.localUsername = '';
      this.localPassword = '';
      this.localNote = '';

      // バリデートエラーをリセット
      this.failedService = false;
      this.failedUsername = false;
      this.failedPassword = false;
    },
    // 保存ボタンのクリックイベント
    // ======================================================================================================
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
          note: this.localNote,
        });

        // 入力値をクリア
        this.hide();
      }
    },
    // 編集ボタンのクリックイベント
    // ======================================================================================================
    handleEditable(state) {
      if(state) {
        this.localModalTitle = 'Edit Record';
      } else {
        this.localModalTitle = 'View Record';
      }
      this.localIsEditable = state;
    },
    // 削除ボタンのクリックイベント
    // ======================================================================================================
    handleDelete() {
      this.$emit('delete', {
        id: this.newEditablePassword.id,
        service: this.localService,
        username: this.localUsername,
        password: this.localPassword,
        note: this.localNote,
      });
      this.hide();
    },
    // パスワードの復元
    // ======================================================================================================
    handleRestore() {
      this.$emit('next', {
        id: this.newEditablePassword.id,
        service: this.localService,
        username: this.localUsername,
        password: this.localPassword,
        note: this.localNote,
      });
      this.hide();
    },
    // パスワードの再生成アニメーションをトリガー
    // ======================================================================================================
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
    generateStrongPassword(probabilities=[3,3,2,1]) {
      const charset = {
        lowercase: 'abcdefghijklmnopqrstuvwxyz',
        uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        numbers: '0123456789',
        symbols: '!@#$%^&*'
      };

      // 各文字の重みを設定
      let weightedCharacters = "";
      if (this.passwordRules.lowercase) weightedCharacters += charset.lowercase.repeat(parseInt(probabilities[0]));
      if (this.passwordRules.uppercase) weightedCharacters += charset.uppercase.repeat(parseInt(probabilities[1]));
      if (this.passwordRules.numbers) weightedCharacters += charset.numbers.repeat(parseInt(probabilities[2]));
      if (this.passwordRules.symbols) weightedCharacters += charset.symbols.repeat(parseInt(probabilities[3]));

      // パスワード生成
      let password = "";
      for (let i = 0; i < this.passwordLength; i++) {
          password += weightedCharacters.charAt(Math.floor(Math.random() * weightedCharacters.length));
      }

      // 生成されたパスワードを返す
      this.localPassword =  password;
    },
    // テキストエリアの高さを自動調整
    // ======================================================================================================
    adjustHeight(event) {
      const element = event.target;
      element.style.height = 'auto'; // 高さを一度リセット
      element.style.height = element.scrollHeight + 'px'; // スクロール高さに合わせて高さを設定
    }
  },
  watch: {
    newEditablePassword(newVal) {
      this.localId = newVal.id;
      this.localService = newVal.service;
      this.localUsername = newVal.username;
      this.localPassword = newVal.password;
      this.localNote = newVal.note;
    },
    isVisible(newVal) {
      if (newVal) {
        this.modal.show();           // isVisible が true になったらモーダルを表示
      } else {
        this.modal.hide();           // isVisible が false になったらモーダルを非表示
      }
    },
    isEditable(newVal) {
      this.handleEditable(newVal);  // isEditable プロップの変更を監視
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
  right: 57px;
  height: auto;
  width: auto;
  padding: 0;
  border: none;
}

.is-invalid ~ .btn-genpass {
  right: 80px;
}

.autoresize {
    resize: none; /* ユーザーによるリサイズを無効にする */
    overflow: hidden; /* スクロールバーが表示されないようにする */
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