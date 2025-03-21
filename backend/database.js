const mysql = require('mysql2/promise');

const DB_CONFIG = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

module.exports = {
  setupDatabase: async () => {
    // データベースファイルを開く
    const connection = await mysql.createConnection(DB_CONFIG);
  
    // ユーザーテーブルの作成
    await connection.execute(`CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(20) NOT NULL UNIQUE,
      password VARCHAR(200) NOT NULL
    )`);

    // パスワードテーブルの作成
    await connection.execute(`CREATE TABLE IF NOT EXISTS passwords (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      service VARCHAR(50) NOT NULL,
      username VARCHAR(50) NOT NULL,
      password VARCHAR(255) NOT NULL,
      note TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      deleted_at TIMESTAMP NULL DEFAULT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`);

    // データベースのクローズ（通常はアプリケーションの終了時などに行います）
    await connection.end();
  },

  openDb: async () => {
    return mysql.createConnection(DB_CONFIG);
  },
}