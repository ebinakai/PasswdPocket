# ベースイメージを指定
FROM node:18-slim

# 作業ディレクトリを設定
WORKDIR /backend

ARG FRONTEND_URL
ARG DB_FILE

# 環境変数の設定
ENV FRONTEND_URL=${FRONTEND_URL}
ENV DB_FILE=${DB_FILE}

# 最新のnpmをインストール
RUN npm install -g npm@10.8.3

# 依存関係のインストールのためにpackage.jsonとpackage-lock.jsonをコピー
COPY ./package*.json ./
RUN npm install

COPY . .

# アプリケーションを実行
CMD ["node", "server.js"]
