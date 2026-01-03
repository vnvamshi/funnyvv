# VistaView Runbook

## Start All Services
```bash
cd ~/vistaview_WORKING
./start-all.sh
```

## Stop All Services
```bash
cd ~/vistaview_WORKING
./stop-all.sh
```

## Health Checks
```bash
# Check frontend
curl http://localhost:5200

# Check backend
curl http://localhost:3005/api/health

# Check dashboard
curl http://localhost:3006/dashboard

# Check Ollama
curl http://localhost:11434/api/tags
```

## View Logs
```bash
# Backend log
tail -f ~/vistaview_WORKING/logs/backend.log

# Dashboard log
tail -f ~/vistaview_WORKING/logs/dashboard.log

# Learner log
tail -f ~/vistaview_WORKING/logs/learner.log

# Frontend log
tail -f ~/vistaview_WORKING/logs/frontend.log
```

## Manual Backup
```bash
cd ~/vistaview_WORKING/ops/scripts
./backup.sh
```

## Restore from Backup
```bash
cd ~/vistaview_WORKING/ops/scripts
./restore.sh <backup_file>
```

## Troubleshooting

### Port already in use
```bash
lsof -ti:5200 | xargs kill -9  # Frontend
lsof -ti:3005 | xargs kill -9  # Backend
lsof -ti:3006 | xargs kill -9  # Dashboard
```

### Ollama not responding
```bash
ollama serve &
ollama list
```

### Reset to clean state
```bash
./stop-all.sh
rm -rf node_modules
npm install
./start-all.sh
```
