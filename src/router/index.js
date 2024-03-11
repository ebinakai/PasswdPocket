import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Trash from '../views/Trash.vue';
import Login from '../views/Login.vue';
import Signup from '../views/Signup.vue';
import Logout from '../views/Logout.vue';
import apiClient from '@/api/client';

const routes = [
  { path: '/', component: Home, meta: { requiresAuth: true } },
  { path: '/trash', component: Trash, meta: { requiresAuth: true } },
  { path: '/login', component: Login },
  { path: '/signup', component: Signup },
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
    const token = sessionStorage.getItem('token');
    
    if (!token) {
      // トークンがsessionStorageにない場合は、ログインページへリダイレクト
      next('/login');
    } else {
      // `/valid` エンドポイントでトークンの検証を行う
      apiClient.post('/valid', {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(response => {
        // トークンが有効な場合はルート遷移を許可
        next();
      })
      .catch(error => {
        // トークンが無効な場合はsessionStorageからトークンを削除し、ログインページへリダイレクト
        sessionStorage.removeItem('token');
        next('/login');
      });
    }
  } else {
    // ログインが不要なページはそのまま進む
    next();
  }
});

export default router;