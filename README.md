# PasswdPocket

> VueJSで作成したシンプルなパスワードマネージャ「Passwd Pocket」です。
> パーソナルユースにとどめ、自己責任で使用してください。

<img width="1912" alt="screencapture- 2024-03-11 12 58 55" src="https://github.com/EbinaKai/PasswdPocket/assets/85666313/de3809f0-96c6-45b2-be76-bc725416de18">

## Features

現在実装済み及び実装予定の機能は以下のとおりです。

- [x] ユーザーごとのパスワード管理
- [x] パスワードの新規作成
- [x] パスワードの確認
- [x] パスワードの編集
- [x] パスワードのゴミ箱への移動
- [x] パスワードのゴミ箱からの復元
- [ ] パスワードジェネレータ

## Setup

バックエンドサーバとフロントエンドサーバに分かれており、パスワード情報は`sqlite`にマスターキーによる暗号化を施して保存しています。

### Front End

```bash
# clone ripository
git clone https://github.com/EbinaKai/PasswdPocket.git
cd PasswdPocket

# install libraries
npm install

# Compile and Hot-Reload for Development
npm run dev

# Compile and Minify for Production 
npm run build

# release
sudo cp -R dist /var/www/html # Your DocumentRoot
```

### Back End

```bash
# set .env
cp .env.sample .env

# update .env

# run backend server
node ./backend/server.js

# or run forever
sudo apt install pm2
pm2 start ./backend/server.js
```

## Credit

以下のライブラリを使用しています。

- [x] [Vue JS](https://v3.ja.vuejs.org/) as framework.
- [x] [Vue Router](https://router.vuejs.org/) for navigation.
- [x] [Json Web Tokens](https://jwt.io/) for API verification.
- [x] [SQLite](https://www.sqlite.org/) as a database.

