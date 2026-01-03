# VistaView Port Assignments

| Port | Service | Description |
|------|---------|-------------|
| 5200 | Frontend | Vite dev server (React app) |
| 3005 | Backend API | Express server (voice, queries, stats) |
| 3006 | AI Dashboard | Learning stats dashboard |
| 11434 | Ollama | LLM inference (gpt-oss:20b) |
| 5432 | PostgreSQL | Database (if enabled) |
| 9000 | MinIO | Object storage (if enabled) |

## Port Conflicts
If you see "port already in use" errors:
```bash
# Kill process on specific port
lsof -ti:<PORT> | xargs kill -9

# Or kill all vistaview services
./stop-all.sh
```

## Network Access
By default, services bind to `localhost`. To allow network access:
```bash
npm run dev -- --port 5200 --host 0.0.0.0
```
