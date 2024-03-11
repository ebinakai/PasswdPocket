<template>
  <SideBar />
  <div class="page-wrapper flex-grow-1 d-flex flex-column px-3 pt-5">
    <header class="d-flex justify-content-between">
      <h1>Passwd Pocket</h1>
      <div class="me-3" id="btn-add">
        <button class="btn btn-theme-3 btn-icon-lg rounded-pill" @click="openAddModal"><span class="material-symbols-outlined">add</span></button>
      </div>
    </header>
    
    <main class="flex-grow-1 pt-4 overflow-y-auto">

      <div class="list-pw">
        <!-- table header -->
        <div class="list-pw-head">
          <div class="row">
            <div class="col-12 col-sm-4 col-lg-3 d-flex align-items-center justify-content-between">
              <p class=" m-0">Service</p>
              <button class="btn btn-icon btn-outline-theme-4" @click="sortBy('service')">
                <span class="material-symbols-outlined">
                  {{ sortKey !== 'service' ? 'expand_all': ( sortReversed ? 'keyboard_arrow_up': 'keyboard_arrow_down' ) }}
                </span>
              </button>
            </div>
  
            <div class="col-sm-8 col-lg-4 d-none d-sm-flex align-items-center justify-content-between">
              <p class="ps-2 m-0">Username</p>
              <button class="btn btn-icon btn-outline-theme-4" @click="sortBy('username')">
                <span class="material-symbols-outlined">
                  {{ sortKey !== 'username' ? 'expand_all': ( sortReversed ? 'keyboard_arrow_up': 'keyboard_arrow_down' ) }}
                </span>
              </button>
            </div>
  
            <div class="col-lg-5 d-none d-lg-flex align-items-center justify-content-between" style="height: 40px;">
              <p class="ps-2 m-0">Password</p>
            </div>
          </div>
        </div>
        <!-- End table header -->
        <!-- table body -->
        
        <div class="list-pw-body">
          <!-- パスワードがない場合 -->
          <div class="w-100" v-if="listPasswords.length === 0">
            <div class="text-center">pocket is empty...</div>
          </div>

          <!-- パスワード一覧 -->
          <div v-for="(password, index) in listPasswords" :key="index" class="row">

            <!-- サービス名 -->
            <div class="col-sm-4 col-lg-3 d-flex align-items-center justify-content-between">
              <div class="d-flex align-items-center justify-content-between flex-grow-1">
                {{ password.service }}
                <button class="btn btn-icon btn-outline-theme-4" @click="copy(password.username, `username-${index}`)">
                  <span class="material-symbols-outlined">{{ lastCopied === `username-${index}` ? 'done' : 'content_copy' }}</span>
                </button>
              </div>
              <div class="btn-wrapper d-flex d-sm-none justify-content-center align-items-center">
                <!-- EditModal を開く -->
                <button class="btn btn-outline-theme-3 btn-icon" @click="openEditModal(password)">
                  <span class="material-symbols-outlined">edit_square</span>
                </button>
              </div>
            </div>

            <!-- ユーザー名 -->
            <div class="col-sm-8 col-lg-4 d-none d-sm-flex align-items-center justify-content-between ps-3" @click="test">
              <div class="d-flex align-items-center justify-content-between flex-grow-1">
                {{ password.username }}
                <button class="btn btn-icon btn-outline-theme-4" @click="copy(password.username, `username-${index}`)">
                  <span class="material-symbols-outlined">{{ lastCopied === `username-${index}` ? 'done' : 'content_copy' }}</span>
                </button>
              </div>
              <div class="btn-wrapper d-flex d-lg-none justify-content-center align-items-center">
                <!-- EditModal を開く -->
                <button class="btn btn-outline-theme-3 btn-icon" @click="openEditModal(password)">
                  <span class="material-symbols-outlined">edit_square</span>
                </button>
              </div>
            </div>

            <!-- パスワード -->
            <div class="col-lg-5 d-none d-lg-flex align-items-center justify-content-between">
              <div class="flex-grow-1 d-flex justify-content-between align-items-center ps-2">
                {{ password.isVisible ? password.password : '********' }}
                <button class="btn btn-icon btn-outline-theme-4" @click="copy(password.password, `password-${index}`)">
                  <span class="material-symbols-outlined">{{ lastCopied === `password-${index}` ? 'done' : 'content_copy' }}</span>
                </button>
              </div>
              <div class="btn-wrapper d-flex justify-content-center align-items-center">
                <button class="btn btn-outline-success btn-icon" @click="toggleVisiblePassword(index)">
                  <span class="material-symbols-outlined">
                    {{ password.isVisible ? 'visibility' : 'visibility_off'}}
                  </span>
                </button>
                
                <!-- EditModal を開く -->
                <button class="btn btn-outline-theme-3 btn-icon" @click="openEditModal(password)">
                  <span class="material-symbols-outlined">edit_square</span>
                </button>
                
                <!-- ConfirmModal を開く -->
                <button class="btn btn-outline-danger btn-icon" @click="openConfirmModal(password)">
                  <span class="material-symbols-outlined">delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        <!-- End table body -->
      </div>
    </main>
    
    <footer class="text-center py-2">
      &copy; EbinaKai 2024
    </footer>
  </div>

  <!-- 追加モーダル -->
  <PasswordModal 
    ref="addPasswordModal" 
    @next="addPassword"
    modalTitle='New Record'
  />

  <!-- 編集モーダル -->
  <PasswordModal 
    ref="editPasswordModal" 
    @next="editPassword"
    modalTitle='Edit Record'
    :newService="editablePassword.service"
    :newUsername="editablePassword.username"
    :newPassword="editablePassword.password"
  />

  <!-- 確認モーダル -->
  <ConfirmModal 
    ref="confirmModal" 
    @next="deletePassword"
    confirmMessage="Are you sure you want to delete this item?" />
  
</template>

<script>
import SideBar from '../components/SideBar.vue';
import PasswordModal from '../components/PasswordModal.vue';
import ConfirmModal from '../components/ConfirmModal.vue';
import apiClient from '@/api/client';
import { encrypt, decrypt } from '@/api/cryption';

export default {
  name: 'Home',
  components: {
    SideBar,
    PasswordModal,
    ConfirmModal,
  },
  data() {
    return {
      editablePassword: {},
      listPasswords: [],
      key: sessionStorage.getItem('key'),
      token: sessionStorage.getItem('token'),
      lastCopied: '',
      sortKey: 'service',
      sortReversed: false,
    };
  },
  methods: {
    test(){
      console.log('test');
    },
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

    // パスワード追加モーダルを開く
    // ======================================================================================================
    openAddModal() {
      this.$refs.addPasswordModal.show();
    },

    // パスワード編集モーダルを開く
    // ======================================================================================================
    openEditModal(password) {
      this.editablePassword = { ...password }; // クリックされた行のデータで editablePassword を更新
      this.$refs.editPasswordModal.show(); // モーダルを開く
    },

    // パスワード削除モーダルを開く
    // ======================================================================================================
    openConfirmModal(password) {
      this.editablePassword = { ...password };
      this.$refs.confirmModal.show();
    },

    // パスワード一覧を取得
    // ======================================================================================================
    async getPasswordList() {
      // パスワード一覧を取得
      const response = await apiClient.post('/password_list', {
        token: sessionStorage.getItem('token')
      }, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      // パスワード一覧を取得したら、パスワードを復号化して listPasswords に格納
      this.listPasswords = response.data.passwords.map( item => {
        return {
          id: item.id,
          service: item.service,
          username: item.username,
          password: decrypt(item.password, decrypt(this.key, response.data.key)),
          isVisible: false,
        }
      });

      // ソート
      this.sortBy();
    },

    // パスワード表示の切り替え
    // ======================================================================================================
    toggleVisiblePassword(index) {
      this.listPasswords[index].isVisible = !this.listPasswords[index].isVisible;
    },

    // パスワードを追加
    // ======================================================================================================
    async addPassword(data) {
      // パスワードをデータベースに登録
      const response = await apiClient.post('/add_password', {
        service: data.service,
        username: data.username,
        password: encrypt(data.password, this.masterKey),
      }, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      // パスワード登録成功したら一覧を再取得
      this.getPasswordList();
    },

    // パスワードを編集
    // ======================================================================================================
    async editPassword(data) {
      // 編集結果をデータベースに送信
      const response = await apiClient.post('/edit_password', {
        id: this.editablePassword.id,
        service: data.service,
        username: data.username,
        password: encrypt(data.password, this.masterKey),
      }, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      // パスワード登録成功したら一覧を再取得
      this.getPasswordList();
    },

    // パスワードを削除
    // ======================================================================================================
    async deletePassword() {
      // 削除対象のパスワードをデータベースから削除
      const response = await apiClient.post('/delete_password', {
        id: this.editablePassword.id,
      }, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      // パスワード削除成功したら一覧を再取得
      this.getPasswordList();
    },

    // マスターキーを復号化
    // ======================================================================================================
    async decryptMasterKey() {
      // 複号キーを取得
      const valid = await apiClient.post('/valid', {}, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      // sessionStorage に保存されているマスターキーを復号化
      this.masterKey = decrypt(sessionStorage.getItem('key'), valid.data.key);
    },
  },
  mounted() {
    // パスワード一覧を取得
    this.getPasswordList();

    // マスターキーを復号化
    this.decryptMasterKey();
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

#btn-add {
  position: fixed;
  bottom: 5rem;
  right: 5rem;
  transition: transform .3s;
}

#btn-add:hover {
  transform: scale(1.3);
}

@media screen and (max-width: 992px) {
  #btn-add {
    bottom: 3rem;
    right: 1rem;
  }
  
}
</style>
