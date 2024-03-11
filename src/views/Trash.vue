<template>
  <SideBar />
  <div class="page-wrapper flex-grow-1 d-flex flex-column px-3 pt-5">
    <header class="d-flex justify-content-between">
      <h1>Back Pocket</h1>
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
</template>

<script>
import SideBar from '../components/SideBar.vue';
import PasswordModal from '../components/PasswordModal.vue';
import ConfirmModal from '../components/ConfirmModal.vue';
import apiClient from '@/api/client';


export default {
  name: 'Trash',
  components: {
    SideBar,
  },
  data() {
    return {
      editablePassword: {},
      listPasswords: [],
    };
  },
  methods: {
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

      // response.data.passwords にパスワード一覧が入っている
      console.debug('Get Passwords Successfully:', response.data);
      this.listPasswords = response.data.passwords;
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