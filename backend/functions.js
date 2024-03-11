import bcrypt from 'bcrypt';
import crypto from 'crypto';

const fixedSalt = 'yourFixedSaltHere'; // 固定の塩

// パスワードのハッシュ化
export const hashPassword = async (password, saltRounds=10) => {
  return bcrypt.hash(password, saltRounds); // パスワードのハッシュ化
}

// パスワードの固定の値にハッシュ化
export const hashWithFixedSalt = (password, salt=fixedSalt) => {
  const hash = crypto.createHash('sha256');
  hash.update(password + salt);  // パスワードと固定の塩を組み合わせる
  return hash.digest('hex');  // ハッシュ値を16進数の文字列として出力
}

export const comparePassword = (password, passwordHash) => {
  return bcrypt.compare(password, passwordHash);
}
