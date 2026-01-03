# VistaView Documentation

## Quick Links
- [RUNBOOK.md](RUNBOOK.md) - How to start/stop/validate
- [PORTS.md](PORTS.md) - Port assignments
- [CHANGELOG.md](CHANGELOG.md) - Version history
- [LLM.md](LLM.md) - AI/LLM configuration

## Software Requirements
- Node.js 18+
- Ollama with gpt-oss:20b model
- PostgreSQL 15+ with pgvector (optional)
- MinIO (optional, for backups)

## Quick Start
```bash
cd ~/vistaview_WORKING
./start-all.sh
```

## URLs
| Service | URL |
|---------|-----|
| Frontend | http://localhost:5200 |
| Dashboard | http://localhost:3006/dashboard |
| Backend API | http://localhost:3005/api/stats |
| Ollama | http://localhost:11434 |
