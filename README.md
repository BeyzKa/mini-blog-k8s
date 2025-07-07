# 📝 MINI BLOG – Fullstack Kubernetes Project

This project is a simple **blog sharing platform** where users can create, view, and delete blog posts. It is fully **containerized** and runs seamlessly in a Kubernetes environment.

---

## 🚀 Technologies Used

- **Frontend**: HTML, Plain JavaScript (Vanilla JS), CSS
- **Backend**: Node.js, Express, PostgreSQL
- **Database**: PostgreSQL (⚠️ runs inside Kubernetes, **no local install required**)
- **Containerization**: Docker
- **Orchestration**: Kubernetes
- **Configuration Management**: ConfigMap, Secret, PVC, Namespace

---


## ⚙️ Setup Instructions

### 0. Start Minikube and Use Minikube Docker

```bash
minikube start --driver=docker

# Use Minikube’s Docker daemon
& minikube -p minikube docker-env | Invoke-Expression
```
> On windows
> ⚠️ This ensures Docker images you build are available inside the Minikube cluster.

### 0.1 Build the Backend Docker Image

```bash
cd backend
docker build -t blog-backend .
cd ..
```

> 💡 The `deployment.yaml` file for backend expects an image named `blog-backend`.


### 1. Create the Kubernetes Namespace

```bash
kubectl apply -f namespace.yaml
```

### 2. Deploy PostgreSQL Resources

```bash
kubectl apply -f db/configmap.yaml
kubectl apply -f db/secrets.yaml     # NOTE: Not included in Git, must be created locally, check the secrets.template.yaml file
kubectl apply -f db/pvc.yaml
kubectl apply -f db/postgres-deployment.yaml
kubectl apply -f db/postgres-service.yaml
```

> 📌 The `secrets.yaml` file is excluded from Git. Use the `secrets.template.yaml` provided to create your own `secrets.yaml` file with appropriate base64-encoded values.

### 3. Deploy the Backend

```bash
kubectl apply -f backend/configmap.yaml
kubectl apply -f backend/deployment.yaml
kubectl apply -f backend/service.yaml
```

### 4. Deploy the Frontend

```bash
kubectl apply -f frontend/frontend-html-configmap.yaml
kubectl apply -f frontend/deployment.yaml
kubectl apply -f frontend/service.yaml
```

---

## 🔁 Port Forwarding (For Local Testing)

```bash
# Backend
kubectl port-forward svc/backend 3000:3000 -n blog-project

# Frontend
kubectl port-forward svc/frontend 8080:80 -n blog-project
```

> Then access the frontend via [http://localhost:8080](http://localhost:8080)

---

## 🔐 Using `secrets.template.yaml`

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: postgres-secret
  namespace: blog-project
type: Opaque
data:
  POSTGRES_USER: <base64-encoded-username>
  POSTGRES_PASSWORD: <base64-encoded-password>
  POSTGRES_DB: <base64-encoded-dbname>
```

- Create the actual `secrets.yaml` based on this template.
- Use `echo -n 'value' | base64` to encode values.

---

## 📌 Notes

### 🛠️ Backend API
- Supports both `/api/posts` and `/posts` endpoints.
- Visit [`http://localhost:3000/`](http://localhost:3000/) in your browser or use curl:
  ```bash
  curl http://localhost:3000/
  ```
- Expected JSON response:
  ```json
  {
    "message": "Mini Blog Backend API",
    "endpoints": [
      "GET /health",
      "GET /posts or /api/posts",
      "POST /posts or /api/posts",
      "DELETE /posts/:id or /api/posts/:id"
    ]
  }
  ```

### 🌐 Frontend
- Sends HTTP requests to `localhost:3000` (the backend).
- Requires backend port-forwarding if using a ClusterIP service.

### 🗄️ PostgreSQL
- Data is persisted using a **PVC** (PersistentVolumeClaim).

### 🧭 Namespace
- All resources are deployed under the Kubernetes namespace: `blog-project`.


---

## 🧼 Cleanup

```bash
kubectl delete namespace blog-project
```

---

## 🧪 Test Scenarios

- [ ] Create a blog post
- [ ] Retrieve all blog posts
- [ ] Delete a blog post
- [ ] Ensure frontend-backend communication works
- [ ] Check if pods correctly use PVC and Secrets
- [ ] Validate all deployments rollout successfully


---

This `README.md` aims to provide full documentation of the project setup and usage, ensuring a smooth experience for future developers.
