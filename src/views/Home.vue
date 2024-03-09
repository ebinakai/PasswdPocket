<template>
  <SideBar />
  <div class="page-wrapper flex-grow-1 d-flex flex-column px-3 pt-5">
    <header class="d-flex justify-content-between">
      <h1>Passwd Pocket</h1>
      <div class="me-3">
        <button class="btn btn-secondary btn-icon" data-bs-toggle="modal" data-bs-target="#newPwModal"><span class="material-symbols-outlined">add</span></button>
      </div>
    </header>
    
    <main class="flex-grow-1">
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
          <tr>
            <td scope="row">google</td>
            <td>myname@gmail.com</td>
            <td>passwd</td>
            <td>
              <div class="d-flex justify-content-center">
                <button class="btn btn-outline-success btn-icon"><span class="material-symbols-outlined">visibility</span></button>
                <button class="btn btn-outline-secondary btn-icon"><span class="material-symbols-outlined">edit_square</span></button>
                <button class="btn btn-outline-danger btn-icon"><span class="material-symbols-outlined">delete</span></button>
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
  <!-- Modal -->
  <div class="modal fade" id="newPwModal" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="newPwModalLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5" id="newPwModalLabel">New Record</h1>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div class="mb-4">
            <input type="text"
                  id="newUsername"
                  class="form-control"
                  :class="{ 'is-invalid': failed_username }"
                  aria-labelledby="usernameHelpBlock"
                  placeholder="Username"
                  v-model="new_username">
          </div>
          <div class="mb-4">
            <input type="password"
                  id="newPassword"
                  class="form-control"
                  :class="{ 'is-invalid': failed_password }"
                  aria-labelledby="passwordHelpBlock"
                  placeholder="Password"
                  v-model="new_password">
          </div>
          <div>
            <input type="password"
                  id="newPasswordAgain"
                  class="form-control"
                  :class="{ 'is-invalid': failed_password_again }"
                  aria-labelledby="passwordHelpBlock"
                  placeholder="Password Again"
                  v-model="new_password_again">
          </div>
        </div>
        <div class="modal-footer">
          <button id="newRecordSubmit" type="button" class="btn btn-secondary flex-grow-1 w-100">Save</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SideBar from '../components/SideBar.vue';
import axios from 'axios';

export default {
  name: 'Home',
  components: {
    SideBar
  },
  data() {
    return {
      new_username: '',
      new_password: '',
      new_password_again: '',
      failed_username: false, // ユーザー名入力のバリデーション状態
      failed_password: false, // パスワード入力のバリデーション状態
      failed_password_again: false, // パスワード確認入力のバリデーション状態
    };
  },
  methods: {
    validateForm() {
      this.failed_username = this.new_username.trim() === '';
      this.failed_password = this.new_password.trim() === '';
      this.failed_password_again = this.new_password_again.trim() === '' || this.new_password !== this.new_password_again;

      if (!this.failed_username && !this.failed_password && !this.failed_password_again) {
        this.closeModal();
        this.new_username = '';
        this.new_password = '';
        this.new_password_again = '';
        console.log('submit');
      }
    },
    closeModal() {
      const modalElement = document.getElementById('newPwModal');
      const modalInstance = bootstrap.Modal.getInstance(modalElement);
      modalInstance.hide();
    }
  },
  mounted() {
    document.getElementById('newRecordSubmit').addEventListener('click', this.validateForm);
  },
  beforeUnmount() {
    document.getElementById('newRecordSubmit').removeEventListener('click', this.validateForm);
  }
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