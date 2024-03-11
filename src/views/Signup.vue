<template>
  <div class="page-wrapper flex-grow-1 d-flex flex-column px-3 pt-5">
    <header>
      <h1 class="text-center">Passwd Pocket</h1>
    </header>

    <main class="flex-grow-1 d-flex align-items-center justify-content-center">
      <form @submit.prevent="validateForm" class="py-4">
        <h2 class="text-center fs-3 mb-4">Welcome</h2>
        <div class="mb-4">
          <input type="text" class="form-control" placeholder="New Username" v-model="username" :class="{ 'is-invalid': failedUsername }" autocomplete="username">
        </div>
        <div class="mb-4">
          <input type="password" class="form-control" aria-labelledby="passwordHelpBlock" placeholder="New Password" v-model="password" :class="{ 'is-invalid': failedPassword }" autocomplete="current-password">
        </div>
        <div class="mb-4">
          <input type="password" class="form-control" aria-labelledby="passwordHelpBlock" placeholder="New Password Again" v-model="passwordAgain" :class="{ 'is-invalid': failedPasswordAgain }" autocomplete="current-password">
        </div>
        <div class="d-grid gap-2">
          <button class="btn btn-secondary" type="submit">Make Pocket</button>
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
import { hashWithFixedSalt, encrypt } from '@/api/cryption';

export default {
  name: 'Signup',
  data() {
    return {
      username: '',
      password: '',
      passwordAgain: '',
      failedUsername: false, // ユーザー名入力のバリデーション状態
      failedPassword: false, // パスワード入力のバリデーション状態
      failedPasswordAgain: false, // パスワード再入力のバリデーション状態
    };
  },
  methods: {
    async validateForm() {
      this.failedUsername = this.username.trim() === '';
      this.failedPassword = this.password.trim() === '';
      this.failedPasswordAgain = this.passwordAgain.trim() === '' && this.password === this.passwordAgain;

      if (!this.failedUsername && !this.failedPassword && !this.failedPasswordAgain) {
        await this.signup(); // signupメソッドの完了を待つ
        this.username = '';
        this.password = '';
        this.passwordAgain = '';
      }
    },
    async signup() {
      try {
        
        const response = await apiClient.post('/signup', {
          username: this.username,
          password: this.password,
        });

        // パスワードを暗号化してセッションストレージに保存
        const encryptedPassword = encrypt(this.password, response.data.key);
        sessionStorage.setItem('token', response.data.token);
        sessionStorage.setItem('key', encryptedPassword);
        
        // // サインアップ成功後の処理を行う
        this.$router.push('/'); // ルートパスにリダイレクト
      } catch (error) {
        console.error('Login failed:', error);
        // サインアップ失敗時の処理を行う
        this.failedUsername = true;
        this.failedPassword = true;
        this.failedPasswordAgain = true;
      }
    }
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