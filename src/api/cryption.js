import CryptoJS from 'crypto-js';

// データを暗号化する関数
export const encrypt = (text, secretKey) => {
  // 秘密鍵と初期化ベクトル (IV) を生成
  const key = CryptoJS.enc.Utf8.parse(secretKey);
  const iv = CryptoJS.lib.WordArray.random(128/8); // 16バイトのIV

  // 暗号化
  const encrypted = CryptoJS.AES.encrypt(text, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });

  // IVを暗号文に含めて返却
  return iv.toString() + encrypted.toString();
};

// 暗号化されたデータを復号化する関数
export const decrypt = (ciphertext, secretKey) => {
  // 秘密鍵を生成
  const key = CryptoJS.enc.Utf8.parse(secretKey);

  // IVを抽出
  const iv = CryptoJS.enc.Hex.parse(ciphertext.substr(0, 32));
  const encryptedText = ciphertext.substr(32);

  // 復号化
  const decrypted = CryptoJS.AES.decrypt(encryptedText, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });

  return decrypted.toString(CryptoJS.enc.Utf8);
};
