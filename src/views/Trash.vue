<template>
  <SideBar />
  <div class="page-wrapper flex-grow-1 d-flex flex-column px-3 pt-5">
    <header class="d-flex justify-content-between">
      <h1>Back Pocket</h1>
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
            <td scope="row">
              {{ password.service }}
            </td>
            <td>
              <button class="btn-outline-sccess btn-icon"></button>
              {{ password.username }}
            </td>
            <td>
              <button class="btn-outline-sccess btn-icon"></button>
              {{ password.isVisible ? password.password : '********' }}
            </td>
            <td>
              <div class="d-flex justify-content-center">
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
            </td>
          </tr>
        </tbody>
      </table>
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

    toggleVisiblePassword(index) {
      this.listPasswords[index].isVisible = !this.listPasswords[index].isVisible;
    },

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
#table-pw tr {
  border-bottom: 1px solid var(--base-color-2);
}

#table-pw tr td, #table-pw tr th {
  padding: .5rem;
}

#table-pw tr th, #table-pw td {
  width: 30%;
}

#table-pw tr td:hover {
  color: var(--base-color-4);
  cursor: pointer;
}
</style>
