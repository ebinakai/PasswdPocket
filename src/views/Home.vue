<template>
  <div class="page-wrapper flex-grow-1 d-flex flex-column">
    <header class="py-3 ps-4 border-bottom text-center text-sm-start">
      <h1>Passwd Pocket</h1>
    </header>
    
    <div class="d-flex flex-sm-row flex-column flex-grow-1">
      <!-- サイドバー -->
      <SideBar ref="sideBar" />

      <!-- パスワードリスト -->
      <div class="page-wrapper flex-grow-1 d-flex flex-column px-3 ">
        <main class="flex-grow-1 pt-sm-4 overflow-y-auto">
          <PasswordTable 
            ref="passwordTable"
            :listPasswords="listPasswords"
            @openViewModal="openViewModal"
            @openEditModal="openEditModal"
            @openConfirmModal="openConfirmModal"/>
        </main>
      </div>
    </div>

    <footer class="text-center py-2">
      &copy; EbinaKai 2024
    </footer>

    <!-- 追加ボタン -->
    <div class="me-3" id="btn-add">
      <button class="btn btn-theme-3 btn-icon-lg rounded-pill" @click="openAddModal"><span class="material-symbols-outlined">add</span></button>
    </div>

    <!-- 追加モーダル -->
    <PasswordModal 
      ref="addPasswordModal" 
      @next="addPassword"
    />

    <!-- 編集モーダル -->
    <PasswordModal 
      ref="editPasswordModal" 
      @next="editPassword"
      @delete="openConfirmModal"
      newModalTitle='Edit Record'
      :newEditablePassword="editablePassword"
      :isEditable="isEditable"
    />

    <!-- 確認モーダル -->
    <ConfirmModal 
      ref="confirmModal" 
      @next="deletePassword"
      confirmMessage="Are you sure you want to delete this item?" />
  </div>
</template>

<script>
import SideBar from '../components/SideBar.vue';
import PasswordTable from '../components/PasswordTable.vue';
import PasswordModal from '../components/PasswordModal.vue';
import ConfirmModal from '../components/ConfirmModal.vue';
import apiClient from '@/api/client';
import { encrypt, decrypt } from '@/api/cryption';
import { getPasswordList, decryptMasterKey } from '@/api/functions';

export default {
  name: 'Home',
  components: {
    SideBar,
    PasswordTable,
    PasswordModal,
    ConfirmModal,
  },
  data() {
    return {
      editablePassword: {},
      listPasswords: [],
      token: sessionStorage.getItem('token'),
      lastCopied: '',
      isEditable: true,
    };
  },
  methods: {
    // パスワード追加モーダルを開く
    // ======================================================================================================
    openAddModal() {
      this.$refs.addPasswordModal.show();
    },
    // パスワード情報表示モーダルを開く
    // ======================================================================================================
    openViewModal(password) {
      this.isEditable = false;
      this.editablePassword = { ...password }; // クリックされた行のデータで editablePassword を更新
      this.$refs.editPasswordModal.show(); // モーダルを開く
    },
    // パスワード編集モーダルを開く
    // ======================================================================================================
    openEditModal(password) {
      this.isEditable = true;
      this.editablePassword = { ...password }; // クリックされた行のデータで editablePassword を更新
      this.$refs.editPasswordModal.show(); // モーダルを開く
    },
    // パスワード削除モーダルを開く
    // ======================================================================================================
    openConfirmModal(password) {
      console.debug("Password: ", password);
      this.editablePassword = { ...password };
      this.$refs.confirmModal.show();
    },
    // パスワード一覧を取得
    // ======================================================================================================
    async handleGetPasswordList() {

      // パスワード一覧を取得したら、パスワードを復号化して listPasswords に格納
      this.listPasswords = await getPasswordList('/password_list', this.token, this.masterKey)

      // ソート
      this.$refs.passwordTable.sortBy();
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
      this.handleGetPasswordList();
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
      this.handleGetPasswordList();
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
      this.handleGetPasswordList();
    },
  },
  mounted() {
    // マスターキーを復号化
    decryptMasterKey(this.token).then( data => {
      this.masterKey = data;

      // パスワード一覧を取得
      this.handleGetPasswordList();
    });
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

#btn-add {
  position: fixed;
  bottom: 5rem;
  right: 5rem;
  transition: all .3s;
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
