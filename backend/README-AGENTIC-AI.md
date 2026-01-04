# VistaView Agentic AI System

## Overview
World-class self-learning AI system with voice capture, empathy analysis, and aggressive web crawling capabilities.

## Features

### 1. Boss Voice Table
- **Table**: `boss_voice_inputs`
- **Purpose**: Captures EVERYTHING you (the boss) say
- **Analysis**: Sentiment, emotion, empathy score, aggression level, politeness
- **API**: `POST /api/boss/voice`

### 2. Team Voice Input
- **Table**: `team_voice_inputs`
- **Purpose**: When you give this to your dev team, their inputs go here
- **API**: `POST /api/team/voice`

### 3. Empathy Learning
- **Table**: `empathy_learning`
- **Patterns**: Gratitude, frustration, joy, anger, confusion, etc.
- **Response templates** for each emotion

### 4. Voice Command Learning
- **Table**: `voice_command_learning`
- **Commands**: Navigation, actions, queries, system commands
- **Variations**: Multiple ways to say the same thing

### 5. Communication Platforms (Crawling)
- **Table**: `communication_platforms`
- **Platforms**: LinkedIn, Twitter, Reddit, Slack, Discord, Alexa, Siri, etc.
- Focus on voice patterns and conversation styles

### 6. Self-Coding Safety Rules
- **Table**: `self_coding_rules`
- **Rules**:
  - NO DROP TABLE
  - NO DELETE ALL
  - NO OVERWRITE WITHOUT BACKUP
  - ALWAYS BACKUP
  - ALWAYS VALIDATE

## Database Tables

| Table | Purpose |
|-------|---------|
| `boss_voice_inputs` | All voice from the boss |
| `team_voice_inputs` | Team member voice |
| `empathy_learning` | Emotion patterns |
| `voice_command_learning` | Command patterns |
| `communication_platforms` | Sites to crawl |
| `self_coding_rules` | Safety rules |
| `learning_activity_log` | Learning history |
| `ai_memories` | Long-term memory |
| `voice_patterns` | Voice recognition |
| `crawled_sources` | Web crawl data |
| `learning_stats` | Daily statistics |

## APIs

### Boss Voice (Live Capture)
```
POST /api/boss/voice
Body: { "text": "your speech", "page_context": "dashboard" }
Response: { "analysis": { sentiment, emotion, empathy_score, ... } }
```

### Dashboard Stats
```
GET /api/dashboard
Returns all stats, tables, recent boss inputs
```

### All Available Endpoints
- GET /api/dashboard
- GET /api/tables
- GET /api/crawled-sites
- GET /api/communication-platforms
- GET /api/voice-patterns
- GET /api/voice-commands
- GET /api/empathy-patterns
- GET /api/boss-inputs
- GET /api/safety-rules
- GET /api/learning-log
- POST /api/boss/voice
- POST /api/team/voice

## Running

```bash
# Start server
cd ~/vistaview_WORKING/backend
node server.cjs

# Start learner (optional)
node learner-daemon.cjs

# Access dashboard
open http://localhost:1117/dashboard
```

## Safety Rules (Enforced)
1. **Never** drop tables
2. **Never** delete all records
3. **Always** backup before modify
4. **Always** validate data
5. **Append only** - no overwrite

## For Dev Team
When giving this to your team:
1. Each team member uses `/api/team/voice` with their `user_id`
2. All inputs are logged and analyzed
3. Team can see their patterns in dashboard
4. Boss inputs remain separate

## Architecture
```
Voice Input → Empathy Analysis → PostgreSQL → Dashboard
     ↓
Boss/Team Tables → Learning Patterns → AI Memory
     ↓
Web Crawling → Communication Patterns → Knowledge Base
```

---
Created: January 4, 2026
Version: 28.0-agentic
