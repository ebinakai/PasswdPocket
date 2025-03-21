# Kubernetes環境内での動かし方

```bash
# ビルド
docker build -t passwd-pocket-frontend ./frontend --build-arg VITE_BACKEND_URL=/api
docker build ./backend -t passwd-pocket-backend

# タグ
docker tag passwd-pocket-frontend:latest registry.kb/passwd-pocket-frontend:latest
docker tag passwd-pocket-backend:latest registry.kb/passwd-pocket-backend:latest

# プッシュ
docker push registry.kb/passwd-pocket-backend:latest
docker push registry.kb/passwd-pocket-frontend:latest

# init

```