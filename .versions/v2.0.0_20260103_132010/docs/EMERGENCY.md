# 🆘 VISTAVIEW EMERGENCY PROCEDURES

> **If you're in a panic, start here.**

---

## 🔴 QUICK EMERGENCY COMMANDS

```bash
# STOP EVERYTHING
./vistaview.sh stop

# CHECK WHAT'S WRONG
./vistaview.sh check

# RESTORE TO LAST WORKING VERSION
./vistaview.sh versions           # See what's available
./vistaview.sh restore v1.0.5     # Pick one

# NUCLEAR OPTION: RESTORE FROM GITHUB
./vistaview.sh restore-from-github

# ABSOLUTE NUCLEAR: START COMPLETELY FRESH
rm -rf ~/vistaview_WORKING
git clone https://github.com/vnvamshi/funnyvv.git ~/vistaview_WORKING
cd ~/vistaview_WORKING
./vistaview.sh setup
```

---

## 📋 EMERGENCY SCENARIOS

### Scenario 1: Frontend Won't Load

```bash
# Check if it's running
lsof -i :5200

# Kill and restart
lsof -ti:5200 | xargs kill -9
cd ~/vistaview_WORKING
npm run dev -- --port 5200
```

### Scenario 2: Backend API Down

```bash
# Check logs
tail -50 ~/vistaview_WORKING/logs/backend.log

# Restart backend
cd ~/vistaview_WORKING/backend
pkill -f "node.*server.cjs"
node server.cjs &
```

### Scenario 3: AI Dashboard Blank

```bash
# Check if backend is feeding data
curl http://localhost:3005/api/dashboard

# Restart dashboard
cd ~/vistaview_WORKING/dashboard
pkill -f "node.*dashboard"
node server.cjs &
```

### Scenario 4: AI Data Corrupted

```bash
# Check ai-data.json
cat ~/vistaview_WORKING/data/ai-data.json | head -20

# Restore from last version
./vistaview.sh versions
./vistaview.sh restore v1.0.X     # Pick latest good one

# Or restore just the data file
cp ~/.versions/v1.0.X_*/data/ai-data.json ~/vistaview_WORKING/data/
```

### Scenario 5: Ollama Not Working

```bash
# Check status
ollama list

# Restart Ollama
pkill ollama
ollama serve &

# Test
curl http://localhost:11434/api/tags

# If model missing
ollama pull gpt-oss:20b
```

### Scenario 6: NPM Dependency Hell

```bash
# Nuclear option
cd ~/vistaview_WORKING
rm -rf node_modules package-lock.json
npm cache clean --force
npm install --legacy-peer-deps
```

### Scenario 7: Everything is Gone (New Machine)

```bash
# 1. Install Homebrew (if Mac)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 2. Install Node.js
brew install node

# 3. Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# 4. Pull AI models
ollama pull gpt-oss:20b
ollama pull nomic-embed-text

# 5. Clone from GitHub
git clone https://github.com/vnvamshi/funnyvv.git ~/vistaview_WORKING

# 6. Setup
cd ~/vistaview_WORKING
chmod +x vistaview.sh
./vistaview.sh setup
```

### Scenario 8: GitHub is Down

```bash
# Use local archive
ls -la ~/vistaview_ARCHIVE/

# Find latest
unzip ~/vistaview_ARCHIVE/vistaview_v1.0.X_*.zip -d ~/vistaview_WORKING

# Setup
cd ~/vistaview_WORKING
./vistaview.sh setup
```

### Scenario 9: Lost GitHub Access

```bash
# Check archives
ls -la ~/vistaview_ARCHIVE/

# Restore from archive
cd ~/vistaview_ARCHIVE
unzip vistaview_v1.0.X_TIMESTAMP.zip -d ~/vistaview_WORKING
cd ~/vistaview_WORKING
./vistaview.sh setup

# Create new GitHub repo and push
# 1. Create new repo on github.com
# 2. Update remote
cd ~/vistaview_WORKING
git init
git remote add origin https://github.com/YOUR_NEW_REPO.git
git add -A
git commit -m "Restored from local archive"
git push -u origin main
```

---

## 🔒 SECURITY EMERGENCY

### Someone Got My GitHub Token

1. **Immediately revoke token:**
   - Go to https://github.com/settings/tokens
   - Find and delete the compromised token

2. **Check for unauthorized changes:**
   ```bash
   cd ~/Documents/GitHub/funnyvv
   git log --oneline -20
   ```

3. **Generate new token:**
   - https://github.com/settings/tokens/new
   - Select `repo` scope only
   - Store securely (NEVER in code)

4. **Review commit history:**
   ```bash
   git log --all --oneline
   # Look for suspicious commits
   ```

### Suspicious Process Running

```bash
# Check what's running
ps aux | grep vistaview
ps aux | grep node

# Kill suspicious process
kill -9 <PID>

# Check ports
lsof -i :3005 -i :3006 -i :5200

# Kill everything and restart fresh
./vistaview.sh stop
./vistaview.sh start
```

---

## 📊 HEALTH CHECK COMMANDS

```bash
# Full system check
./vistaview.sh check

# Manual health checks
curl http://localhost:5200          # Frontend
curl http://localhost:3005/api/health   # Backend
curl http://localhost:3006/dashboard    # Dashboard
curl http://localhost:11434/api/tags    # Ollama

# Check AI stats
curl http://localhost:3005/api/stats

# Check logs
tail -100 ~/vistaview_WORKING/logs/backend.log
tail -100 ~/vistaview_WORKING/logs/learner.log
tail -100 ~/vistaview_WORKING/logs/dashboard.log
tail -100 ~/vistaview_WORKING/logs/frontend.log
```

---

## 📞 ESCALATION PATH

1. **First:** Try `./vistaview.sh restart`
2. **Second:** Try `./vistaview.sh restore v1.0.X`
3. **Third:** Try `./vistaview.sh restore-from-github`
4. **Fourth:** Fresh clone from GitHub
5. **Fifth:** Restore from local archive
6. **Last Resort:** Contact team lead

---

## 🗄️ BACKUP LOCATIONS

| Type | Location | Retention |
|------|----------|-----------|
| Local Versions | `~/.versions/` | Last 10 |
| Local Archives | `~/vistaview_ARCHIVE/` | Last 15 |
| GitHub | github.com/vnvamshi/funnyvv | Unlimited |
| AI Data | `~/vistaview_WORKING/data/ai-data.json` | In all backups |

---

## ⚠️ WHAT NOT TO DO

- ❌ Don't delete `data/ai-data.json` without backup
- ❌ Don't run `rm -rf` on working directory without backup
- ❌ Don't force push to GitHub without checking
- ❌ Don't share GitHub tokens in chat/email
- ❌ Don't ignore error messages
- ❌ Don't skip version backups before major changes

---

## ✅ RECOVERY CHECKLIST

After any emergency recovery:

- [ ] All services running? (`./vistaview.sh status`)
- [ ] AI stats look correct? (check interactions count)
- [ ] Frontend loading? (http://localhost:5200)
- [ ] Dashboard showing data? (http://localhost:3006/dashboard)
- [ ] Created new backup? (`./vistaview.sh backup "Post-recovery"`)
- [ ] Synced to GitHub? (`./vistaview.sh sync`)

---

*Keep calm and restore from backup.*
