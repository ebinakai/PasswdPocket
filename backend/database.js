// database.js
import sqlite3 from 'sqlite3';
import { open } from 'sqlite'; // sqliteパッケージを利用
import { hashPassword } from './functions.js';

const saltRounds = 10; // bcrypt のソルトの生成に使用するラウンド数
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
    service varchar(50) NOT NULL,
    username varchar(50) NOT NULL,
    password varchar(255) NOT NULL,
    created_at TIMESTAMP DEFAULT (DATETIME('now', 'localtime')),
    updated_at TIMESTAMP DEFAULT (DATETIME('now', 'localtime')),
    deleted_at TIMESTAMP DEFAULT NULL
  )`);

  // ユーザーデータの挿入（パスワードは実際にはハッシュ化するべきです）
  const users = [
    { username: 'root', password: 'root' },
    { username: 'user2', password: 'password2' }
  ];

  // 各ユーザーに対してINSERT文を実行
  for (const user of users) {
    const hashedPassword = await hashPassword(user.password); // ハッシュ化されたパスワードをさらにハッシュ化
    await db.run('INSERT OR IGNORE INTO users (username, password) VALUES (?, ?)', [user.username, hashedPassword]);
  }

  // ユーザーデータの挿入（パスワードは実際にはハッシュ化するべきです）
  // const passwords = [
  //   { service: 'Google', username: 'user1', password: 'f490ed9801071ddfae6a0ae3c707588fB4fGFNEB0g6qTDpQNuWHtw==' },
  //   { service: 'Amazon', username: 'user2', password: '0d958755f37c8083e758ffe34c9ef324/wpSJ7unoR6+oArjmV3bkg==' },
  //   { service: 'Aniplex', username: 'root', password: '308b559fc2aecdcc15c0fd749f6078f8o5q1IU64v4s/bSI0KLu/KQ==' }
  // ];

  // 各ユーザーに対してINSERT文を実行
  // for (const password of passwords) {
  //   await db.run('INSERT OR IGNORE INTO passwords (user_id, service, username, password) VALUES (?, ?, ?, ?)', [1, password.service, password.username, password.password]);
  // }

  // データベースのクローズ（通常はアプリケーションの終了時などに行います）
  await db.close();
};

export const openDb = async () => {
  return open({
    filename: DB_FILE,
    driver: sqlite3.Database,
  });
};