const crypto = require('crypto');
const bcrypt = require('bcrypt');

module.exports = {
  hashPassword: async (password, saltRounds = 10) => {
    return bcrypt.hash(password, saltRounds); // パスワードのハッシュ化
  },
  
  comparePassword: (password, passwordHash) => {
    return bcrypt.compare(password, passwordHash);
  },

  // 安全なランダムキーを生成する関数
  generateKey: (length = 32) => {
    return crypto.randomBytes(length).toString('hex');
  },
};
