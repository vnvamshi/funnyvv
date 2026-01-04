# VistaView Global Agentic AI System

## 🌐 Overview

A world-class, self-learning AI system that scales from **Boss → Dev Team → Universe**.

**Core Principle**: Learn from patterns, not people.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                     VISTAVIEW AGENTIC AI                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐             │
│  │    BOSS     │    │  DEV TEAM   │    │  UNIVERSE   │             │
│  │  (You)      │    │  (Internal) │    │ (All Users) │             │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘             │
│         │                  │                  │                     │
│         └──────────────────┼──────────────────┘                     │
│                            │                                        │
│                            ▼                                        │
│              ┌─────────────────────────────┐                        │
│              │      AGENTIC BAR            │                        │
│              │  (Single Interaction Layer) │                        │
│              └──────────────┬──────────────┘                        │
│                             │                                       │
│                             ▼                                       │
│              ┌─────────────────────────────┐                        │
│              │  GLOBAL INTERACTION LEDGER  │                        │
│              │    (Central Learning DB)    │                        │
│              └──────────────┬──────────────┘                        │
│                             │                                       │
│         ┌───────────────────┼───────────────────┐                   │
│         ▼                   ▼                   ▼                   │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐             │
│  │  PATTERNS   │    │  EMPATHY    │    │  PERSONAS   │             │
│  │  (Learned)  │    │  (Emotions) │    │  (Behavior) │             │
│  └─────────────┘    └─────────────┘    └─────────────┘             │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📊 Database Tables

### Core Tables

| Table | Purpose |
|-------|---------|
| `global_interaction_ledger` | **Central learning ledger** - ALL interactions |
| `learned_patterns` | Extracted patterns (de-identified, clustered) |
| `agent_personas` | Mr. V behavior configurations |
| `system_rules` | Safety rules (never break) |
| `onboarding_prompts` | Ready-to-drop cloud prompts |
| `flow_states` | User journey tracking |

### Supporting Tables

| Table | Purpose |
|-------|---------|
| `boss_voice_inputs` | Boss voice history |
| `empathy_learning` | Emotion patterns |
| `voice_command_learning` | Command patterns |
| `communication_platforms` | Sites to crawl |
| `crawled_sources` | Web crawl data |

---

## 🔌 API Endpoints

### Universal Logging (The Core)

```
POST /api/ledger/log
Body: {
    "user_type": "boss|dev_team|vendor|builder|buyer|visitor",
    "raw_transcript": "what the user said",
    "page_route": "/current/page",
    "modal_name": "optional_modal",
    "interaction_mode": "voice|text"
}
Response: {
    "success": true,
    "ledger_id": 123,
    "pattern_id": 45,
    "analysis": { sentiment, emotion, intent, empathy_score, ... }
}
```

### Shortcuts

```
POST /api/boss/voice    → { text: "...", page_context: "..." }
POST /api/team/voice    → { text: "...", user_id: "..." }
POST /api/user/voice    → { text: "...", user_type: "vendor" }
```

### Query APIs

```
GET /api/dashboard      → All stats + recent entries
GET /api/ledger         → Recent ledger entries
GET /api/patterns       → Learned patterns
GET /api/personas       → Agent personas
GET /api/prompts        → Onboarding prompts
GET /api/rules          → System rules
```

---

## 🔒 Safety Rules (NEVER BREAK)

| Rule | Description |
|------|-------------|
| `NO_DELETE` | Never delete data without boss confirmation |
| `NO_OVERWRITE` | Always backup before modifying |
| `CONFIRM_PUBLISH` | Confirm before permanent changes |
| `LOG_EVERYTHING` | Every interaction must be logged |
| `SINGLE_AGENTIC_BAR` | All interactions through Agentic Bar |
| `PRESERVE_STACK` | Maintain navigation stack for "go back" |

---

## 🎭 Agent Personas

| Persona | Context | Tone | Speed |
|---------|---------|------|-------|
| Boss Mode | Boss interaction | Efficient | Fast |
| Vendor Onboarding | New vendors | Friendly | Normal |
| Builder Showcase | Builders | Professional | Normal |
| Buyer Search | Home buyers | Enthusiastic | Normal |
| Dev Team | Development | Technical | Fast |

---

## 📜 Ready-to-Drop Prompts

### 1. System Prompt (Cloud/RAG)

Feed this to your AI backend:

```
You are Mr. V, the global agentic intelligence of VistaView...
[Full prompt in database: onboarding_prompts WHERE prompt_type = 'system']
```

### 2. User Welcome (First Visit)

```
Welcome to VistaView. I'm Mr. V — your intelligent, hands-free real estate assistant...
```

### 3. Dev Team Onboarding

```
VistaView uses a global Agentic Bar as its primary interaction surface...
```

---

## 🚀 Scaling

### Local (You)
- All interactions logged to `global_interaction_ledger`
- Patterns extracted automatically
- Dashboard shows real-time stats

### Dev Team
- Same ledger, different `user_type = 'dev_team'`
- Their voice trains the system
- Same rules apply

### Production (Universe)
- Deploy to AWS RDS
- All users contribute to learning
- Patterns are de-identified
- System self-improves

---

## 📈 What Gets Learned

### ✅ Learns

- Language variations ("go back" vs "return" vs "previous")
- Timing patterns (when users hesitate)
- UX friction points
- Successful vs failed flows
- Industry-specific phrasing
- Error recovery strategies

### ❌ Does NOT Learn

- Personal identities
- Voice biometrics
- Private content
- User-specific secrets

---

## 🛠️ Running

```bash
# Start server
cd ~/vistaview_WORKING/backend
node server.cjs

# Access dashboard
open http://localhost:1117/dashboard
```

---

## 📋 Frontend Integration

To send voice commands from any frontend:

```javascript
// Log any interaction
fetch('http://localhost:1117/api/ledger/log', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        user_type: 'vendor',        // Who is speaking
        raw_transcript: 'the text', // What they said
        page_route: '/vendor/signup', // Where they are
        interaction_mode: 'voice'   // How they said it
    })
});
```

---

## 🎯 The Goal

> **Reduce friction, increase clarity, deliver human-like experience at scale.**

Every conversation anywhere makes VistaView smarter everywhere.

---

**Version**: 29.0-global  
**Created**: January 4, 2026  
**Author**: VistaView AI Team
