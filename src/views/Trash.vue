<template>
  <SideBar />
  <div class="page-wrapper flex-grow-1 d-flex flex-column px-3 pt-5">
    <header class="d-flex justify-content-between">
      <h1>Back Pocket</h1>
    </header>
    
    <main class="flex-grow-1 pt-4">
      <div class="list-pw">
        
        <!-- table header -->
        <div class="list-pw-head">
          <div class="row">
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
          <div class="w-100" v-if="listPasswords.length === 0">
            <div class="text-center">pocket is empty...</div>
          </div>

          <!-- パスワード一覧 -->
          <div v-for="(password, index) in listPasswords" :key="index" class="row">

            <!-- サービス名 -->
            <div class="col-sm-4 col-lg-3 d-flex align-items-center justify-content-between">
              <div class="d-flex align-items-center justify-content-between flex-grow-1">
                {{ password.service }}
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
              </div>
              <div class="btn-wrapper d-flex justify-content-center align-items-center">
                <button class="btn btn-outline-success btn-icon" @click="toggleVisiblePassword(index)">
                  <span class="material-symbols-outlined">
                    {{ password.isVisible ? 'visibility' : 'visibility_off'}}
                  </span>
                </button>
                
                <!-- ConfirmModal を開く -->
                <button class="btn btn-outline-theme-2 btn-icon" @click="openConfirmModal(password)">
                  <span class="material-symbols-outlined">restore_from_trash</span>
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

  <!-- 確認モーダル -->
  <ConfirmModal 
    ref="confirmModal" 
    @next="restorePassword"
    confirmMessage="Are you sure you want to restore this item?" />
</template>

<script>
import SideBar from '../components/SideBar.vue';
import ConfirmModal from '../components/ConfirmModal.vue';
import apiClient from '@/api/client';
import { encrypt, decrypt } from '@/api/cryption';

export default {
  name: 'Trash',
  components: {
    SideBar,
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
    // パスワード復元モーダルを開く
    // ======================================================================================================
    openConfirmModal(password) {
      this.editablePassword = { ...password };
      this.$refs.confirmModal.show();
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
</style>
