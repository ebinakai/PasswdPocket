<template>
  <div class="page-wrapper flex-grow-1 d-flex flex-column">
    <header class="py-3 ps-4 border-bottom text-center text-sm-start">
      <h1>Back Pocket</h1>
    </header>
    <div class="d-flex flex-sm-row flex-column flex-grow-1">
      <SideBar ref="sideBar" />
      <div class="page-wrapper flex-grow-1 d-flex flex-column px-3 ">
        <main class="flex-grow-1 pt-sm-4 overflow-y-auto">
          <PasswordTable 
            ref="passwordTable"
            view="trash"
            :listPasswords="listPasswords"
            @openViewModal="openViewModal"
            @openConfirmModal="openConfirmModal"/>
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
import PasswordTable from '../components/PasswordTable.vue';
import PasswordModal from '../components/PasswordModal.vue';
import ConfirmModal from '../components/ConfirmModal.vue';
import apiClient from '@/api/client';
import { encrypt, decrypt } from '@/api/cryption';
import { getPasswordList, decryptMasterKey } from '@/api/functions';

export default {
  name: 'Trash',
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
      sortKey: 'service',
      sortReversed: false,
    };
  },
  methods: {
    // パスワード情報表示モーダルを開く
    // ======================================================================================================
    openViewModal(password) {
      this.isEditable = false;
      this.editablePassword = { ...password }; // クリックされた行のデータで editablePassword を更新
      this.$refs.editPasswordModal.show(); // モーダルを開く
    },
    // パスワード復元モーダルを開く
    // ======================================================================================================
    openConfirmModal(password) {
      this.editablePassword = { ...password };
      this.$refs.confirmModal.show();
    },
    // パスワード一覧を取得
    // ======================================================================================================
    async handleGetPasswordList() {

      // パスワード一覧を取得したら、パスワードを復号化して listPasswords に格納
      this.listPasswords = await getPasswordList('/trash_list', this.token, this.masterKey)

      // ソート
      this.$refs.passwordTable.sortBy();
    },
    // パスワード復元
    // ======================================================================================================
    async restorePassword() {
      // 削除対象のパスワードをデータベースから削除
      const response = await apiClient.post('/restore_password', {
        id: this.editablePassword.id,
      }, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      // パスワード復元成功したら一覧を再取得
      this.handleGetPasswordList();
    },
    // マスターキーを復号化
    // ======================================================================================================
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
</style>
