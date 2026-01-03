# 👥 VISTAVIEW TEAM GUIDE

## For Developers Building on AWS/EC2

This guide explains how to integrate the VistaView AI system with your existing AWS infrastructure.

---

## 🎯 The Goal: Plug & Play AI

Your team is building VistaView on:
- AWS EC2
- S3 Storage
- MinIO
- PostgreSQL (RDS)

The AI system (Mr. V, Learning Engine, Dashboard) should be **plug & play** - easily deployable alongside your existing infrastructure.

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         YOUR AWS INFRASTRUCTURE                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐          │
│  │   EC2        │    │   RDS        │    │   S3/MinIO   │          │
│  │  (Backend)   │◄──►│ (PostgreSQL) │    │  (Storage)   │          │
│  └──────────────┘    └──────────────┘    └──────────────┘          │
│         │                   ▲                   ▲                   │
│         │                   │                   │                   │
│         ▼                   │                   │                   │
│  ┌──────────────────────────┴───────────────────┴───────────────┐  │
│  │                    VISTAVIEW AI MODULE                        │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐              │  │
│  │  │ Mr. V      │  │  Learning  │  │    AI      │              │  │
│  │  │ Assistant  │  │   Engine   │  │ Dashboard  │              │  │
│  │  │ (Voice)    │  │ (Crawler)  │  │ (Stats)    │              │  │
│  │  └────────────┘  └────────────┘  └────────────┘              │  │
│  │         │              │              │                       │  │
│  │         └──────────────┼──────────────┘                       │  │
│  │                        ▼                                      │  │
│  │              ┌────────────────┐                               │  │
│  │              │    Ollama      │                               │  │
│  │              │  (gpt-oss:20b) │                               │  │
│  │              └────────────────┘                               │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📦 Integration Options

### Option 1: Sidecar Deployment (Recommended)

Deploy AI module as a separate service alongside your main app.

```bash
# On your EC2 instance

# 1. Clone AI module
git clone https://github.com/vnvamshi/funnyvv.git /opt/vistaview-ai

# 2. Setup
cd /opt/vistaview-ai
./vistaview.sh setup

# 3. Configure to use your PostgreSQL
cat > .env.local << 'EOF'
DATABASE_URL=postgresql://user:pass@your-rds-host:5432/vistaview
S3_BUCKET=your-s3-bucket
REDIS_URL=redis://your-redis-host:6379
EOF

# 4. Start as service
./vistaview.sh start
```

### Option 2: Docker Deployment

```dockerfile
# Dockerfile for AI module
FROM node:18-alpine

WORKDIR /app
COPY . .

RUN npm install --legacy-peer-deps
RUN cd backend && npm install
RUN cd dashboard && npm install

EXPOSE 3005 3006 5200

CMD ["./vistaview.sh", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  vistaview-ai:
    build: .
    ports:
      - "3005:3005"
      - "3006:3006"
      - "5200:5200"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - OLLAMA_URL=http://ollama:11434
    depends_on:
      - ollama
  
  ollama:
    image: ollama/ollama
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama

volumes:
  ollama_data:
```

### Option 3: Lambda/Serverless (API Only)

For serverless deployments, use only the backend API:

```javascript
// lambda/handler.js
const { processVoiceCommand } = require('./voice-processor');
const { queryAI } = require('./ai-query');

exports.handler = async (event) => {
  const { action, payload } = JSON.parse(event.body);
  
  switch (action) {
    case 'voice':
      return processVoiceCommand(payload.command);
    case 'query':
      return queryAI(payload.question);
    default:
      return { statusCode: 400, body: 'Unknown action' };
  }
};
```

---

## 🔌 API Integration

### Your Backend → VistaView AI

```javascript
// In your existing backend code

const VISTAVIEW_AI_URL = process.env.VISTAVIEW_AI_URL || 'http://localhost:3005';

// Process voice command
async function processVoice(command) {
  const response = await fetch(`${VISTAVIEW_AI_URL}/api/voice/process`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ command })
  });
  return response.json();
}

// Query AI
async function askAI(question) {
  const response = await fetch(`${VISTAVIEW_AI_URL}/api/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question })
  });
  return response.json();
}

// Get AI stats for dashboard
async function getAIStats() {
  const response = await fetch(`${VISTAVIEW_AI_URL}/api/stats`);
  return response.json();
}
```

### Frontend Integration

```javascript
// In your React frontend

// Add Mr. V assistant button
import MrVButton from './components/MrVButton';

function App() {
  return (
    <div>
      {/* Your existing app */}
      <MrVButton apiUrl="http://your-ai-server:3005" />
    </div>
  );
}
```

---

## 🗄️ Database Migration

### From JSON to PostgreSQL

The AI module currently uses `ai-data.json`. To migrate to your PostgreSQL:

```sql
-- Create tables in your RDS

CREATE TABLE ai_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_type VARCHAR(50),
  context TEXT,
  learned_data JSONB,
  confidence_score DECIMAL(5,4),
  accessed_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ai_stats (
  id SERIAL PRIMARY KEY,
  total_interactions INTEGER DEFAULT 0,
  learned_patterns INTEGER DEFAULT 0,
  market_prices_learned INTEGER DEFAULT 0,
  accuracy_score DECIMAL(5,2),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE interaction_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(50),
  command TEXT,
  response JSONB,
  success BOOLEAN,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

```javascript
// backend/db.js - Replace JSON with PostgreSQL

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function saveMemory(memory) {
  await pool.query(
    'INSERT INTO ai_memories (memory_type, context, learned_data, confidence_score) VALUES ($1, $2, $3, $4)',
    [memory.memory_type, memory.context, memory.learned_data, memory.confidence_score]
  );
}

async function getStats() {
  const result = await pool.query('SELECT * FROM ai_stats ORDER BY id DESC LIMIT 1');
  return result.rows[0];
}

module.exports = { saveMemory, getStats };
```

---

## ☁️ AWS Services Integration

### S3 for AI Data Backup

```javascript
// ops/scripts/s3-backup.js

const AWS = require('aws-sdk');
const fs = require('fs');

const s3 = new AWS.S3();

async function backupToS3() {
  const aiData = fs.readFileSync('./data/ai-data.json');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  await s3.putObject({
    Bucket: process.env.S3_BUCKET,
    Key: `backups/ai-data-${timestamp}.json`,
    Body: aiData
  }).promise();
  
  console.log('Backed up to S3');
}

backupToS3();
```

### CloudWatch Logging

```javascript
// backend/logger.js

const AWS = require('aws-sdk');
const cloudwatchlogs = new AWS.CloudWatchLogs();

async function logToCloudWatch(message, level = 'INFO') {
  await cloudwatchlogs.putLogEvents({
    logGroupName: '/vistaview/ai',
    logStreamName: 'backend',
    logEvents: [{
      timestamp: Date.now(),
      message: JSON.stringify({ level, message, timestamp: new Date().toISOString() })
    }]
  }).promise();
}

module.exports = { logToCloudWatch };
```

### EC2 Systemd Service

```bash
# /etc/systemd/system/vistaview-ai.service

[Unit]
Description=VistaView AI Services
After=network.target

[Service]
Type=forking
User=ubuntu
WorkingDirectory=/opt/vistaview-ai
Environment=NODE_ENV=production
Environment=DATABASE_URL=postgresql://...
ExecStart=/opt/vistaview-ai/vistaview.sh start
ExecStop=/opt/vistaview-ai/vistaview.sh stop
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start
sudo systemctl daemon-reload
sudo systemctl enable vistaview-ai
sudo systemctl start vistaview-ai
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml

name: Deploy to EC2

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to EC2
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ubuntu
          key: ${{ secrets.EC2_SSH_KEY }}
          script: |
            cd /opt/vistaview-ai
            git pull origin main
            ./vistaview.sh stop
            npm install --legacy-peer-deps
            ./vistaview.sh start
```

---

## 👥 Team Workflow

### Daily Development Cycle

```bash
# Morning: Get latest
cd ~/vistaview_WORKING
./vistaview.sh restore-from-github
./vistaview.sh start

# Work on features...

# Before changes: Create backup
./vistaview.sh backup "Starting feature X"

# After changes: Backup and sync
./vistaview.sh backup "Completed feature X"
./vistaview.sh sync
# Then commit/push via GitHub Desktop
```

### Code Review Checklist

- [ ] Does `./vistaview.sh check` pass?
- [ ] Did you test on fresh setup?
- [ ] Did you update documentation?
- [ ] Did you create a version backup?
- [ ] Are there any security concerns?
- [ ] Does the AI learning still work?

### Branch Strategy

```
main              ← Production ready
├── develop       ← Integration branch
├── feature/*     ← New features
├── bugfix/*      ← Bug fixes
└── hotfix/*      ← Emergency fixes
```

---

## 🔒 Security for Teams

### Access Levels

| Role | GitHub | EC2 | Database | AI Data |
|------|--------|-----|----------|---------|
| Admin | Full | Full | Full | Full |
| Developer | Push | SSH | Read | Read/Write |
| Viewer | Pull | None | None | Read |

### Secrets Management

```bash
# Use AWS Secrets Manager
aws secretsmanager create-secret \
  --name vistaview/production \
  --secret-string '{"DB_PASSWORD":"xxx","API_KEY":"xxx"}'

# In your app
const secrets = await secretsManager.getSecretValue({
  SecretId: 'vistaview/production'
}).promise();
```

### Never Commit These

```gitignore
# .gitignore
.env
.env.local
.env.production
*.pem
*.key
secrets/
credentials/
```

---

## 📊 Monitoring

### Health Check Endpoint

```bash
# Add to your monitoring system
curl -f http://your-server:3005/api/health || alert
```

### Metrics to Track

| Metric | Source | Alert Threshold |
|--------|--------|-----------------|
| AI Interactions | /api/stats | < 10/hour |
| Learning Engine | logs/learner.log | No activity 1hr |
| Response Time | Backend | > 2 seconds |
| Error Rate | Logs | > 5% |

---

## 📞 Team Contacts

| Role | Responsibility | Contact |
|------|---------------|---------|
| AI Lead | Learning Engine, Models | TBD |
| Backend Lead | API, Database | TBD |
| Frontend Lead | UI, Voice | TBD |
| DevOps | AWS, Deployment | TBD |

---

*Updated: 2026-01-03*
