// database.js
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
const DB_FILE = process.env.DB_FILE;

module.exports = {
  setupDatabase: async () => {
    // データベースファイルを開く
    const db = await open({
      filename: DB_FILE,
      driver: sqlite3.Database,
    });
  
    // ユーザーテーブルの作成
    await db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username VARCHAR(20) NOT NULL UNIQUE,
      password VARCHAR(200) NOT NULL
    )`);
  
    // パスワードテーブルの作成
    await db.run(`CREATE TABLE IF NOT EXISTS passwords (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      service VARCHAR(50) NOT NULL,
      username VARCHAR(50) NOT NULL,
      password VARCHAR(255) NOT NULL,
      note TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMP DEFAULT (DATETIME('now', 'localtime')),
      updated_at TIMESTAMP DEFAULT (DATETIME('now', 'localtime')),
      deleted_at TIMESTAMP DEFAULT NULL
    )`);
  
    // データベースのクローズ（通常はアプリケーションの終了時などに行います）
    await db.close();
  },
  openDb: async () => {
    return open({
      filename: DB_FILE,
      driver: sqlite3.Database,
    });
  },
}