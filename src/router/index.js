import { createRouter, createWebHistory } from 'vue-router';
import axios from 'axios';
import Home from '../views/Home.vue';
import Login from '../views/Login.vue';
import Logout from '../views/Logout.vue';

const routes = [
  { path: '/', component: Home, meta: { requiresAuth: true } }, // ログインが必要なルートにはメタフィールドを追加
  { path: '/login', component: Login },
  { path: '/logout', component: Logout },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// グローバルビフォーガード
router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // ローカルストレージからトークンを取得
    const token = localStorage.getItem('token');
    console.debug('token: ' + token);
    
    if (!token) {
      // トークンがlocalStorageにない場合は、ログインページへリダイレクト
      next('/login');
    } else {
      // `/valid` エンドポイントでトークンの検証を行う
      axios.post('http://localhost:3000/valid', {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(response => {
        // トークンが有効な場合はルート遷移を許可
        next();
      })
      .catch(error => {
        // トークンが無効な場合はlocalStorageからトークンを削除し、ログインページへリダイレクト
        localStorage.removeItem('token');
        next('/login');
      });
    }
  } else {
    // ログインが不要なページはそのまま進む
    next();
  }
});

export default router;