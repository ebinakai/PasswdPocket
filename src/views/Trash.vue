<template>
  <div class="page-wrapper flex-grow-1 d-flex flex-column">
    <header class="py-3 ps-4 border-bottom text-center text-sm-start">
      <h1>Back Pocket</h1>
    </header>
    <div class="d-flex flex-sm-row flex-column flex-grow-1">
      <SideBar ref="sideBar" />
      <div class="page-wrapper flex-grow-1 d-flex flex-column px-3 ">
        <main class="flex-grow-1 pt-sm-4 overflow-y-auto">
          <div class="list-pw">
            
            <!-- table header -->
            <div class="list-pw-head">
              <div class="row fw-bold">
                <div class="col-12 col-sm-4 col-lg-3 d-flex align-items-center justify-content-between">
                  <p class=" m-0">Service</p>
                </div>
      
                <div class="col-sm-8 col-lg-4 d-none d-sm-flex align-items-center justify-content-between">
                  <p class="ps-2 m-0">Username</p>
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
              <div class="w-100 row" v-if="listPasswords.length === 0">
                <div class="text-center d-flex align-items-center">
                  <div class="flex-grow-1">
                    pocket is empty...
                  </div>
                </div>
              </div>
      
              <!-- パスワード一覧 -->
              <div v-for="(password, index) in listPasswords" :key="index" class="row" @click="openViewModal(password)">
    
                <!-- サービス名 -->
                <div class="col-sm-4 col-lg-3 d-flex align-items-center justify-content-between">
                  <div class="d-flex align-items-center flex-grow-1">
                    {{ password.service }}
                  </div>
                </div>

                <!-- ユーザー名 -->
                <div class="col-sm-8 col-lg-4 d-none d-sm-flex align-items-center border-start border-2 ps-3">
                  <div class="d-flex align-items-center flex-grow-1">
                    {{ password.username }}
                  </div>
                </div>
      
                <!-- パスワード -->
                <div class="col-lg-5 d-none d-lg-flex align-items-center justify-content-between">
                  <div class="flex-grow-1 d-flex justify-content-between align-items-center ps-2">
                    {{ password.isVisible ? password.password : '********' }}
                  </div>
                  <div class="btn-wrapper d-flex justify-content-center align-items-center">
                    <button class="btn btn-outline-success btn-icon" @click.stop="toggleVisiblePassword(index)">
                      <span class="material-symbols-outlined">
                        {{ password.isVisible ? 'visibility' : 'visibility_off'}}
                      </span>
                    </button>
                    
                    <!-- ConfirmModal を開く -->
                    <button class="btn btn-outline-theme-2 btn-icon" @click.stop="openConfirmModal(password)">
                      <span class="material-symbols-outlined">restore_from_trash</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <!-- End table body -->
          </div>
        </main>
      </div>
    </div>
    <footer class="text-center py-2">
      &copy; EbinaKai 2024
    </footer>

    <!-- 編集モーダル -->
    <PasswordModal 
      ref="editPasswordModal" 
      @next="openConfirmModal"
      @copy="copy"
      newModalTitle='View Record'
      :newEditablePassword="editablePassword"
      :isEditable="false"
      :isInTrash="true"
    />
  
    <!-- 確認モーダル -->
    <ConfirmModal 
      ref="confirmModal" 
      @next="restorePassword"
      confirmMessage="Are you sure you want to restore this item?" />
  </div>
</template>

<script>
import SideBar from '../components/SideBar.vue';
import PasswordModal from '../components/PasswordModal.vue';
import ConfirmModal from '../components/ConfirmModal.vue';
import apiClient from '@/api/client';
import { encrypt, decrypt } from '@/api/cryption';

export default {
  name: 'Trash',
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
    // パスワード復元モーダルを開く
    // ======================================================================================================
    openConfirmModal(password) {
      this.editablePassword = { ...password };
      this.$refs.confirmModal.show();
    },
    // パスワード情報表示モーダルを開く
    // ======================================================================================================
    openViewModal(password) {
      this.isEditable = false;
      this.editablePassword = { ...password }; // クリックされた行のデータで editablePassword を更新
      this.$refs.editPasswordModal.show(); // モーダルを開く
    },
    // パスワード一覧を取得
    // ======================================================================================================
    async getPasswordList() {
      const token = sessionStorage.getItem('token');

      // トークンがない場合はエラーを出力して終了
      if (token === null) {
        console.error('Token is not found.');
        return;
      }

      // パスワード一覧を取得
      const response = await apiClient.post('/trash_list', {
        token: sessionStorage.getItem('token')
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
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
    },
    // パスワード表示の切り替え
    // ======================================================================================================
    toggleVisiblePassword(index) {
      this.listPasswords[index].isVisible = !this.listPasswords[index].isVisible;
    },
    // パスワード復元
    // ======================================================================================================
    async restorePassword() {
      
      const token = sessionStorage.getItem('token');

      // トークンがない場合はエラーを出力して終了
      if (token === null) {
        console.error('Token is not found.');
        return;
      }


      // 削除対象のパスワードをデータベースから削除
      const response = await apiClient.post('/restore_password', {
        id: this.editablePassword.id,
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // パスワード復元成功したら一覧を再取得
      this.getPasswordList();
    } ,
  },
  mounted() {
    this.getPasswordList();
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
