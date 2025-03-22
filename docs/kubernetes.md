# Kubernetes環境内での動かし方

```bash
# ビルド
docker build -t pocket/frontend ./frontend --build-arg VITE_BACKEND_URL=/api
docker build ./backend -t pocket/backend

# タグ
docker tag pocket/frontend:1.0.0 registry.kb/pocket/frontend:1.0.0
docker tag pocket/backend:1.0.0 registry.kb/pocket/backend:1.0.0

# プッシュ
docker push registry.kb/pocket/backend:1.0.0
docker push registry.kb/pocket/frontend:1.0.0

# init
kubectl apply -f k8s/mysql-secret.yaml
kubectl apply -f k8s/pocket-frontend.yaml
kubectl apply -f k8s/pocket-backend.yaml
```