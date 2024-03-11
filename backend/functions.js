import bcrypt from 'bcrypt';
import crypto from 'crypto';

// パスワードのハッシュ化
export const hashPassword = async (password, saltRounds=10) => {
  return bcrypt.hash(password, saltRounds); // パスワードのハッシュ化
}

export const comparePassword = (password, passwordHash) => {
  return bcrypt.compare(password, passwordHash);
}

// 安全なランダムキーを生成する関数
export function generateKey(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}