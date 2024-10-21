FROM node:18-slim AS build-stage

WORKDIR /frontend

ARG VITE_BACKEND_URL

# 環境変数として設定
ENV VITE_BACKEND_URL=${VITE_BACKEND_URL}

# npmのバージョンを更新
RUN npm install -g npm@10.9.0

# package.jsonとpackage-lock.jsonを先にコピーし、依存関係をインストール
COPY package*.json ./
RUN npm install

# 残りのソースコードをコピー
COPY . .

# Viteでビルド
RUN npm run build

FROM nginx:alpine

COPY --from=build-stage /frontend/dist /usr/share/nginx/html
COPY --from=build-stage /frontend/package-lock.json /tmp/

CMD ["nginx", "-g", "daemon off;"]