FROM node:18-slim AS build-stage

WORKDIR /frontend

# npmのバージョンを更新
RUN npm install -g npm@10.9.0

# package.jsonとpackage-lock.jsonを先にコピーし、依存関係をインストール
COPY package*.json ./

# package-lock.jsonを消してビルドする場合は npm install を使用する
RUN npm ci

# 残りのソースコードをコピー
COPY . .

# 環境変数として設定
ARG VITE_BACKEND_URL
ENV VITE_BACKEND_URL=${VITE_BACKEND_URL}

# Viteでビルド
RUN npm run build

FROM nginx:alpine

COPY --from=build-stage /frontend/dist /usr/share/nginx/html
COPY --from=build-stage /frontend/package-lock.json /tmp/

RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]