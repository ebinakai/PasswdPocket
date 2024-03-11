<template>
  <SideBar />
  <div class="page-wrapper flex-grow-1 d-flex flex-column px-3 pt-5">
    <header class="d-flex justify-content-between">
      <h1>Passwd Pocket</h1>
      <div class="me-3">
        <button class="btn btn-secondary btn-icon" data-bs-toggle="modal" data-bs-target="#newPwModal" @click="openModalAddPassword"><span class="material-symbols-outlined">add</span></button>
      </div>
    </header>
    
    <main class="flex-grow-1 pt-4">
      <table id="table-pw" class="w-100">
        <thead>
          <tr>
            <th scope="col">Service</th>
            <th scope="col">Username</th>
            <th scope="col">Password</th>
            <th scope="col"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="listPasswords.length === 0">
            <th colspan="3" class="text-center">pocket is empty...</th>
          </tr>
          <tr v-for="(password, index) in listPasswords" :key="index">
            <td scope="row">{{ password.service }}</td>
            <td>{{ password.username }}</td>
            <td>{{ password.password }}</td>
            <td>
              <div class="d-flex justify-content-center">
                <button class="btn btn-outline-success btn-icon"><span class="material-symbols-outlined">visibility</span></button>
                
                <!-- EditModal を開く -->
                <button class="btn btn-outline-secondary btn-icon" @click="openEditModal(password)">
                  <span class="material-symbols-outlined">edit_square</span>
                </button>
                
                <!-- ConfirmModal を開く -->
                <button class="btn btn-outline-danger btn-icon" @click="openConfirmModal(password)">
                  <span class="material-symbols-outlined">delete</span>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </main>
    
    <footer class="text-center py-2">
      &copy; EbinaKai 2024
    </footer>
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
    :newService="editablePassword.service"
    :newUsername="editablePassword.username"
    :newPassword="editablePassword.password"
    :newPasswordAgain="editablePassword.password"
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
    };
  },
  methods: {
    // パスワード追加モーダルを開く
    openModalAddPassword() {
      this.$refs.addPasswordModal.show();
    },

    // パスワード編集モーダルを開く
    openEditModal(password) {
      this.editablePassword = { ...password }; // クリックされた行のデータで editablePassword を更新
      this.$refs.editPasswordModal.show(); // モーダルを開く
    },

    // パスワード削除モーダルを開く
    openConfirmModal(password) {
      this.editablePassword = { ...password };
      this.$refs.confirmModal.show();
    },

    // パスワード一覧を取得
    async getPasswordList() {
      const token = sessionStorage.getItem('token');

      // トークンがない場合はエラーを出力して終了
      if (token === null) {
        console.error('Token is not found.');
        return;
      }

      // パスワード一覧を取得
      const response = await apiClient.post('/password_list', {
        token: sessionStorage.getItem('token')
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // response.data.passwords にパスワード一覧が入っている
      console.debug(response.data.passwords);

      // パスワード一覧を取得したら、パスワードを復号化して listPasswords に格納
      this.listPasswords = response.data.passwords.map( item => {
        return {
          id: item.id,
          service: item.service,
          username: item.username,
          password: decrypt(item.password, this.key),
        }
      });
      console.log(this.listPasswords);
    },

    // パスワードを追加
    async addPassword(data) {
      const token = sessionStorage.getItem('token');

      // トークンがない場合はエラーを出力して終了
      if (token === null) {
        console.error('Token is not found.');
        return;
      }

      // パスワードをデータベースに登録
      const response = await apiClient.post('/add_password', {
        service: data.service,
        username: data.username,
        password: encrypt(data.password, this.key),
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // パスワード登録成功したら一覧を再取得
      this.getPasswordList();
    },

    // パスワードを編集
    async editPassword(data) {
      const token = sessionStorage.getItem('token');

      // トークンがない場合はエラーを出力して終了
      if (token === null) {
        console.error('Token is not found.');
        return;
      }

      // 編集結果をデータベースに送信
      const response = await apiClient.post('/edit_password', {
        id: this.editablePassword.id,
        service: data.service,
        username: data.username,
        password: encrypt(data.password, this.key),
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // パスワード登録成功したら一覧を再取得
      this.getPasswordList();
    },

    // パスワードを削除
    async deletePassword() {
      const token = sessionStorage.getItem('token');

      // トークンがない場合はエラーを出力して終了
      if (token === null) {
        console.error('Token is not found.');
        return;
      }


      // 削除対象のパスワードをデータベースから削除
      const response = await apiClient.post('/delete_password', {
        id: this.editablePassword.id,
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // パスワード削除成功したら一覧を再取得
      this.getPasswordList();
    },
  },
  mounted() {
    this.getPasswordList();
  },
}
</script>

<style scoped>
#table-pw tr {
  border-bottom: 1px solid var(--base-color-2);
}

#table-pw tr td, #table-pw tr th {
  padding: .5rem;
}

#table-pw tr th, #table-pw td {
  width: 30%;
}

#table-pw .btn-icon:hover {
  color: var(--bs-btn-color);
  background-color: transparent;
  opacity: .8;
}

#table-pw tr td:hover {
  color: var(--base-color-4);
  cursor: pointer;
}

</style>