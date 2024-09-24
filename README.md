# PasswdPocket

> VueJSで作成したシンプルなパスワードマネージャ「Passwd Pocket」です。
> パーソナルユースにとどめ、自己責任で使用してください。

バックエンドサーバとフロントエンドサーバに分かれており、パスワード情報は`sqlite`ファイルにマスターキーによる暗号化を施して保存しています。

## Demo

### ログイン画面
<img width="1912" alt="Login Page" src="https://github.com/EbinaKai/PasswdPocket/assets/85666313/997391cd-a2c5-4d12-90b8-853175efc779">

### パスワード一覧
<img width="1912" alt="Password List" src="https://github.com/EbinaKai/PasswdPocket/assets/85666313/6807c985-1856-41b6-b45f-8ac46a188fa2">

### パスワードジェネレーター
<img width="1912" alt="Password Generator" src="https://github.com/EbinaKai/PasswdPocket/assets/85666313/1f3da818-0450-4ecd-8c82-9f60737d1aa3">

## Features

現在実装済み及び実装予定の機能は以下のとおりです。

- [x] ユーザーごとのパスワード管理
- [x] パスワードの新規作成
- [x] パスワードの確認
- [x] パスワードの編集
- [x] パスワードのゴミ箱への移動
- [x] パスワードのゴミ箱からの復元
- [x] パスワードジェネレータ

## Setup

一発で起動するはずです。

```bash
# clone ripository
git clone https://github.com/EbinaKai/PasswdPocket.git
cd PasswdPocket

# set .env
cp .env.sample .env

# update .env
nano .env

# docker-compose
docker-compose up -d
```

## Credit

以下のライブラリを使用しています。

- [x] [Vue JS](https://v3.ja.vuejs.org/) as framework.
- [x] [Vue Router](https://router.vuejs.org/) for navigation.
- [x] [Json Web Tokens](https://jwt.io/) for API verification.
- [x] [SQLite](https://www.sqlite.org/) as a database.

