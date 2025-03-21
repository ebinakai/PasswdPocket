# ベースイメージを指定
FROM node:18-slim

# 作業ディレクトリを設定
WORKDIR /backend

ARG FRONTEND_URL

# 環境変数の設定
ENV FRONTEND_URL=${FRONTEND_URL}

# 必要なビルドツールのインストール（ARMアーキテクチャ向けのネイティブモジュールビルド用）
RUN apt-get update && \
    apt-get install -y python3 build-essential g++ && \
    apt-get clean

# npmをインストール
RUN npm install -g npm@10.9.0

# 依存関係のインストールのためにpackage.jsonとpackage-lock.jsonをコピー
COPY ./package*.json ./
RUN npm install

COPY . .

# アプリケーションを実行
CMD ["node", "server.js"]
