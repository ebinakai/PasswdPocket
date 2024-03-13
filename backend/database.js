// database.js
import sqlite3 from 'sqlite3';
import { open } from 'sqlite'; // sqliteパッケージを利用
const DB_FILE = './pocket.sqlite'; // データベースファイルのパス

export const setupDatabase = async () => {
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
    service VARCHAAR(50) NOT NULL,
    username VARCHAAR(50) NOT NULL,
    password VARCHAAR(255) NOT NULL,
    note TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMP DEFAULT (DATETIME('now', 'localtime')),
    updated_at TIMESTAMP DEFAULT (DATETIME('now', 'localtime')),
    deleted_at TIMESTAMP DEFAULT NULL
  )`);

  // データベースのクローズ（通常はアプリケーションの終了時などに行います）
  await db.close();
};

export const openDb = async () => {
  return open({
    filename: DB_FILE,
    driver: sqlite3.Database,
  });
};