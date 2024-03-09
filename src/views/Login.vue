<template>
  <div class="page-wrapper flex-grow-1 d-flex flex-column px-3 pt-5">
    <header>
      <h1 class="text-center">Passwd Pocket</h1>
    </header>

    <main class="flex-grow-1 d-flex align-items-center justify-content-center">
      <form @submit.prevent="validateForm" class="py-4">
        <h2 class="text-center fs-3 mb-4">Login</h2>
        <div class="mb-4">
          <input type="text" class="form-control" placeholder="Username" v-model="username" :class="{ 'is-invalid': failed_username }" autocomplete="username">
        </div>
        <div class="mb-4">
          <input type="password" class="form-control" aria-labelledby="passwordHelpBlock" placeholder="Password" v-model="password" :class="{ 'is-invalid': failed_password }" autocomplete="current-password">
        </div>
        <div class="d-grid gap-2">
          <button class="btn btn-secondary" type="submit">Pocket In</button>
        </div>
      </form>
    </main>
    
    <footer class="text-center py-2">
      &copy; EbinaKai 2024
    </footer>
  </div>
</template>

<script>
import apiClient from '@/api/client';

export default {
  name: 'Login',
  data() {
    return {
      username: '',
      password: '',
      failed_username: false, // ユーザー名入力のバリデーション状態
      failed_password: false, // パスワード入力のバリデーション状態
    };
  },
  methods: {
    async validateForm() {
      this.failed_username = this.username.trim() === '';
      this.failed_password = this.password.trim() === '';

      if (!this.failed_username && !this.failed_password) {
        await this.login(); // loginメソッドの完了を待つ
        this.username = '';
        this.password = '';
        console.log('submit');
      }
    },
    async login() {
      try {
        const response = await apiClient.post('http://localhost:3000/login', {
          username: this.username,
          password: this.password
        });
        console.log('Login successful:', response.data);
        localStorage.setItem('token', response.data.token);
        
        // ログイン成功後の処理を行う
        this.$router.push('/'); // ルートパスにリダイレクト
      } catch (error) {
        console.error('Login failed:', error);
        // ログイン失敗時の処理を行う
        this.failed_username = true;
        this.failed_password = true;
      }
    },
  },
  mounted() {
  },
  beforeUnmount() {
  }
}
</script>

<style scoped>
form {
  width: 100%;
  max-width: 450px;
  padding: 15px;
  margin: auto;
  border: 2px solid var(--base-color-2);
  border-radius: .5rem;
}

form h2 {
  color: var(--base-color-4);
}
</style>