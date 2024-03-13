<template>
  <div class="list-pw">
              
    <!-- table header -->
    <div class="list-pw-head">
      <div class="row fw-bold">
        <div class="col-12 col-sm-4 col-lg-3 d-flex align-items-center justify-content-between cursor-pointer" @click="sortBy('service')">
          <p class=" m-0">Service</p>
          <div class="btn-icon">
            <span class="material-symbols-outlined">
              {{ sortKey !== 'service' ? 'expand_all': ( sortReversed ? 'keyboard_arrow_up': 'keyboard_arrow_down' ) }}
            </span>
          </div>
        </div>

        <div class="col-sm-8 col-lg-4 d-none d-sm-flex align-items-center justify-content-between border-start border-2 cursor-pointer" @click="sortBy('username')">
          <p class="ps-2 m-0">Username</p>
          <div class="btn-icon">
            <span class="material-symbols-outlined">
              {{ sortKey !== 'username' ? 'expand_all': ( sortReversed ? 'keyboard_arrow_up': 'keyboard_arrow_down' ) }}
            </span>
          </div>
        </div>

        <div class="col-lg-5 d-none d-lg-flex align-items-center justify-content-between border-start border-2" style="height: 40px;">
          <p class="ps-2 m-0">Password</p>
        </div>
      </div>
    </div>
    <!-- End table header -->

    <!-- table body -->
    <div class="list-pw-body">
      <!-- パスワードがない場合 -->
      <div class="w-100 row" v-if="listPasswords.length === 0">
        <div class="text-center d-flex align-items-center">
          <div class="flex-grow-1">
            pocket is empty...
          </div>
        </div>
      </div>

      <!-- パスワード一覧 -->
      <div v-for="(password, index) in listPasswords" :key="index" class="row" @click="$emit('openViewModal', password)">

        <!-- サービス名 -->
        <div class="col-sm-4 col-lg-3 d-flex align-items-center justify-content-between">
          <div class="d-flex align-items-center flex-grow-1">
            {{ password.service }}
          </div>
        </div>

        <!-- ユーザー名 -->
        <div class="col-sm-8 col-lg-4 d-none d-sm-flex align-items-center border-start border-2 ps-3">
          <div class="d-flex align-items-center justify-content-between flex-grow-1">
            {{ password.username }}

            <!-- コピーボタン -->
            <button class="btn btn-icon btn-outline-theme-4 border-0" @click.stop="copy(password.username, `username-${index}`)">
              <span class="material-symbols-outlined">{{ lastCopied === `username-${index}` ? 'done' : 'content_copy' }}</span>
            </button>
          </div>
        </div>

        <!-- パスワード -->
        <div class="col-lg-5 d-none d-lg-flex align-items-center justify-content-between">
          <div class="flex-grow-1 d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center">
              <!-- パスワードの表示・非表示切り替え -->
              <button class="btn btn-outline-theme-1 btn-icon border-0" @click.stop="toggleVisiblePassword(index)">
                <span class="material-symbols-outlined">
                  {{ password.isVisible ? 'visibility' : 'visibility_off'}}
                </span>
              </button>
              {{ password.isVisible ? password.password : '・・・・・・・・・' }}
            </div>  

            <!-- コピーボタン -->
            <button class="btn btn-icon btn-outline-theme-4 border-0" @click.stop="copy(password.password, `password-${index}`)">
              <span class="material-symbols-outlined">{{ lastCopied === `password-${index}` ? 'done' : 'content_copy' }}</span>
            </button>
          </div>
          
          <!-- 操作ボタン群 -->
          <div class="btn-wrapper d-flex justify-content-center align-items-center">
            <!-- デフォルトビュー -->
            <template v-if=" view === 'default' ">
              <!-- EditModal を開く -->
              <button class="btn btn-outline-theme-3 btn-icon" @click.stop="$emit('openEditModal', password)">
                <span class="material-symbols-outlined">edit_square</span>
              </button>

              <!-- ConfirmModal を開く -->
              <button class="btn btn-outline-theme-3 btn-icon" @click.stop="$emit('openConfirmModal', password)">
                <span class="material-symbols-outlined">delete</span>
              </button>
            </template>

            <!-- ゴミ箱ビュー -->
            <template v-else-if=" view === 'trash'">
              <!-- ConfirmModal を開く -->
              <button class="btn btn-outline-theme-3 btn-icon" @click.stop="$emit('openConfirmModal', password)">
                <span class="material-symbols-outlined">restore_from_trash</span>
              </button>
            </template>
          </div>
        </div>
      </div>
    </div>
    <!-- End table body -->
  </div>
</template>

<script>
export default {
  name: 'PasswordTable',
  props: {
    listPasswords: {
      type: Object,
      default: [],
    },
    view: {
      type: String,
      default: 'default',
    }
  },
  data() {
    return {
      editablePassword: {},
      lastCopied: '',
      sortKey: 'service',
      sortReversed: false,
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
    // ソート
    // ======================================================================================================
    sortBy(key) {
      // クリップボードの最終コピー情報をリセット
      this.lastCopied = '';

      if (this.sortKey === key) {
        this.sortReversed = !this.sortReversed;
        // ソートキーが同じ場合は逆順にする
        this.listPasswords.reverse();

      } else {
        // ソートキーが異なる場合は、ソートキーを更新
        this.sortReversed = false;

        // ソートキーが指定されていない場合は、this.sortKey を利用
        if (key==undefined) {
          key = this.sortKey;
        }

        // ソートキーを更新
        this.listPasswords.sort((a, b) => {
          if (a[key] > b[key]) {
            return 1;
          }
          if (a[key] < b[key]) {
            return -1;
          }
          return 0;
        });
      }
      this.sortKey = key;
      return;
    },
    // パスワード表示の切り替え
    // ======================================================================================================
    toggleVisiblePassword(index) {
      this.listPasswords[index].isVisible = !this.listPasswords[index].isVisible;
    }
  },
}
</script>

<style scoped>
.list-pw-head > .row,
.list-pw-body > .row {
  border-bottom: .5px solid var(--base-color-2);
  margin: 0;
  padding: .5rem 0;
}

.list-pw-body .row:hover {
  background-color: var(--theme-color-1);
  cursor: pointer;
}

.list-pw-body .row > div {
  min-height: 40px;
}
</style>
