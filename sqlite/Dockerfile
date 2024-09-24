FROM alpine:latest

# 作業ディレクトリを設定
WORKDIR /sqlite

# SQLiteとbashをインストール
RUN apk add --no-cache sqlite sqlite-dev bash

# setup.sqlをコンテナにコピー
COPY setup.sql /tmp

# データベースが存在しない場合にスクリプトを実行
CMD ["sh", "-c", "if [ ! -f pocket.sqlite ]; then sqlite3 pocket.sqlite < /tmp/setup.sql; fi"]