import CryptoJS from 'crypto-js';

const iterations = 5000;
const delimiter = "|||";

// データを暗号化する関数
export const encrypt = (targetText, passPhrase) => {
  // ソルト、初期化ベクトル (IV) を生成
  const salt = CryptoJS.lib.WordArray.random(128 / 8); // 16バイトのソルト
  const iv = CryptoJS.lib.WordArray.random(128 / 8); // 16バイトのIV

  // 秘密鍵を生成
  const key = CryptoJS.PBKDF2(passPhrase, salt, {
    keySize: 128 / 32,
    iterations: iterations,
    hasher: CryptoJS.algo.SHA256,
  });

  // 暗号化
  const encrypted = CryptoJS.AES.encrypt(targetText, key, {
    iv: iv,
  });

  // IVをBase64でエンコードし、暗号文と結合して返却
  return salt.toString(CryptoJS.enc.Base64) + delimiter + iv.toString(CryptoJS.enc.Base64) + delimiter + encrypted.toString();
};

// 暗号化されたデータを復号化する関数
export const decrypt = (ciphertext, passPhrase) => {

  // ソルトとIV、暗号文をデリミタで分割
  const parts = ciphertext.split(delimiter);
  const salt = CryptoJS.enc.Base64.parse(parts[0]);
  const iv = CryptoJS.enc.Base64.parse(parts[1]);
  const encryptedText = parts[2];

  // 秘密鍵を生成
  const key = CryptoJS.PBKDF2(passPhrase, salt, {
    keySize: 128 / 32,
    iterations: iterations,
    hasher: CryptoJS.algo.SHA256,
  });

  // 復号化
  const decrypted = CryptoJS.AES.decrypt(encryptedText, key, {
    iv: iv,
  });

  return decrypted.toString(CryptoJS.enc.Utf8);
};