# ベースイメージを指定
FROM node:18-slim

# 作業ディレクトリを設定
WORKDIR /backend

# 必要なビルドツールのインストール（ARMアーキテクチャ向けのネイティブモジュールビルド用）
RUN apt-get update && \
    apt-get install -y python3 build-essential g++ && \
    apt-get clean

# npmをインストール
RUN npm install -g npm@10.9.0

# 依存関係のインストールのためにpackage.jsonとpackage-lock.jsonをコピー
COPY ./package*.json ./

# package-lock.jsonを消してビルドする場合は npm install を使用する
RUN npm ci

COPY . .

ARG FRONTEND_URL
ENV FRONTEND_URL=${FRONTEND_URL}

# アプリケーションを実行
CMD ["node", "server.js"]
