// database.js
import bcrypt from 'bcrypt';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite'; // sqliteパッケージを利用

const saltRounds = 10; // bcrypt のソルトの生成に使用するラウンド数

export const setupDatabase = async () => {
  // データベースファイルを開く
  const db = await open({
    filename: './pocket.sqlite',
    driver: sqlite3.Database,
  });

  // ユーザーテーブルの作成
  await db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(20) NOT NULL UNIQUE,
    password VARCHAR(200) NOT NULL
  )`);

  // 既存のテーブルを削除
  await db.run('DROP TABLE IF EXISTS passwords');

  // パスワードテーブルの作成
  await db.run(`CREATE TABLE passwords(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    service varchar(50) NOT NULL,
    username varchar(50) NOT NULL,
    password varchar(40) NOT NULL,
    deleted_at DATETIME DEFAULT NULL
  )`);

  // ユーザーデータの挿入（パスワードは実際にはハッシュ化するべきです）
  const users = [
    { username: 'root', password: 'root' },
    { username: 'user1', password: 'password1' },
    { username: 'user2', password: 'password2' }
  ];

  // 各ユーザーに対してINSERT文を実行
  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, saltRounds); // パスワードのハッシュ化
    await db.run('INSERT OR IGNORE INTO users (username, password) VALUES (?, ?)', [user.username, hashedPassword]);
  }

  // ユーザーデータの挿入（パスワードは実際にはハッシュ化するべきです）
  const passwords = [
    { service: 'Google', username: 'user1', password: 'googlepassword1' },
    { service: 'Amazon', username: 'user2', password: 'amazonpassword2' },
    { service: 'Aniplex', username: 'root', password: 'aniplexpassword' }
  ];

  // 各ユーザーに対してINSERT文を実行
  for (const password of passwords) {
    await db.run('INSERT OR IGNORE INTO passwords (user_id, service, username, password) VALUES (?, ?, ?, ?)', [1, password.service, password.username, password.password]);
  }

  // データベースのクローズ（通常はアプリケーションの終了時などに行います）
  await db.close();
};

export const openDb = async () => {
  return open({
    filename: './pocket.sqlite',
    driver: sqlite3.Database,
  });
};