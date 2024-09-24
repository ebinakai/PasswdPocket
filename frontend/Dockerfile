FROM node:18-slim AS build-stage

WORKDIR /frontend

ARG VITE_BACKEND_URL

# 環境変数として設定
ENV VITE_BACKEND_URL=${VITE_BACKEND_URL}

# npmを最新バージョンに更新
RUN npm install -g npm@10.8.3

# package.jsonとpackage-lock.jsonを先にコピーし、依存関係をインストール
COPY package*.json ./
RUN npm install

# 残りのソースコードをコピー
COPY . .

# Viteでビルド
RUN npm run build

FROM nginx:alpine

COPY --from=build-stage /frontend/dist /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]