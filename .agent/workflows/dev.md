---
description: Start local development environment
---

# Start Development Environment

Follow these steps to start the local development environment.

// turbo

1. Start databases with Docker Compose

```bash
cd server && docker-compose up -d postgres redis
```

// turbo 2. Wait for databases to be healthy (10 seconds)

```bash
sleep 10 && docker ps --format "table {{.Names}}\t{{.Status}}"
```

// turbo 3. Run database migrations

```bash
cd server && npm run migration:run
```

4. Start the backend server (runs in background)

```bash
cd server && npm run start:dev
```

5. Start the frontend dev server (in a new terminal)

```bash
cd client && npm run dev
```

6. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000/api/v1
   - Swagger Docs: http://localhost:3000/api/docs
