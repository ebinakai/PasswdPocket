# Kubernetes環境内での動かし方

```bash
# ビルド
docker build -t pocket/frontend:1.0.1 ./frontend --build-arg VITE_BACKEND_URL=/api
docker build ./backend -t pocket/backend:1.0.2

# タグ
docker tag pocket/frontend:1.0.1 registry.kb/pocket/frontend:1.0.1
docker tag pocket/backend:1.0.2 registry.kb/pocket/backend:1.0.2

# プッシュ
docker push registry.kb/pocket/frontend:1.0.1
docker push registry.kb/pocket/backend:1.0.2

# デプロイ
kubectl apply -f k8s/mysql-secret.yaml
kubectl apply -f k8s/frontend.yaml
kubectl apply -f k8s/backend.yaml
```