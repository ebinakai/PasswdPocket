import apiClient from '@/api/client';
import { encrypt, decrypt } from '@/api/cryption';

// パスワード一覧を取得
// ======================================================================================================
export const getPasswordList = async (ep, token, masterKey) => {
  const response = await apiClient.get(ep, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  // パスワード一覧を取得したら、パスワードを復号化して返す
  return response.data.passwords.map( item => {
    return {
      id: item.id,
      service: item.service,
      username: item.username,
      password: decrypt(item.password, masterKey),
      note: item.note,
      isVisible: false,
    }
  });
}
// キーを復号化
// ======================================================================================================
export const decryptMasterKey = async (token) => {
  // 複号キーを取得
  const res = await apiClient.get('/valid', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  // sessionStorage に保存されているマスターキーを復号化
  return decrypt(sessionStorage.getItem('key'), res.data.key);
}