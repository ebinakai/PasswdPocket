# デバッグ方法

package.json を変更したあとにビルドする際は package-lock.json を削除してください。  
また、変更後の package-lock.json を取得するには以下を実行してください。

```bash
# update package.json here

# delete old file
rm frontend/package-lock.json
# or
rm backend/package-lock.json

docker-compose build

# copy lock file
docker run --rm passwd_pocket_frontend cat /tmp/package-lock.json > frontend/package-lock.json
# or
docker run --rm passwd_pocket_backend cat /backend/package-lock.json > backend/package-lock.json
```
