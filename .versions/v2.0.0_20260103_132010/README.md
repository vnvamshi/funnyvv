# 🏠 VistaView - The Amazon of Real Estate

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](#versions)
[![AI Model](https://img.shields.io/badge/AI-gpt--oss:20b-green.svg)](#ai-engine)
[![Status](https://img.shields.io/badge/status-active-success.svg)](#)

---

## 🎯 What is VistaView?

**VistaView** is an AI-powered real estate and home services marketplace platform - essentially **"The Amazon of Real Estate"**. It combines:

- 🏡 **Real Estate Listings** - Properties, rentals, commercial spaces
- 🛋️ **Home Products Marketplace** - Furniture, decor, building materials
- 👷 **Service Provider Network** - Contractors, builders, vendors
- 🤖 **Agentic AI Assistant (Mr. V)** - Voice-controlled, learning AI that helps users navigate
- 📊 **24/7 Self-Learning Engine** - Continuously learns from market data, user interactions

### Core Vision
> *"One platform where you can find a home, furnish it, renovate it, and manage it - all guided by an AI that learns and improves every day."*

---

## 🧠 Agentic AI System

### Mr. V - The AI Assistant

Mr. V is VistaView's voice-controlled AI assistant that:

| Capability | Description |
|------------|-------------|
| 🎤 **Voice Commands** | Natural language processing for hands-free navigation |
| 🔍 **Smart Search** | Understands context: "Find me a 3-bedroom near downtown" |
| 📈 **Market Insights** | Real-time price trends, comparisons, recommendations |
| 🎓 **Continuous Learning** | Learns from every interaction, improves over time |
| 🌐 **Web Crawling** | Scrapes Zillow, Redfin, IKEA, Home Depot for latest data |
| 💬 **Conversational** | Remembers context, provides personalized responses |

### Learning Sources (8 Active)

| Source | Category | Data Collected |
|--------|----------|----------------|
| Zillow | Real Estate | Property prices, trends, listings |
| Redfin | Real Estate | Market analytics, comparisons |
| Realtor.com | Real Estate | Listing details, agent info |
| IKEA | Furniture | Product catalog, prices |
| Wayfair | Home Goods | Furniture, decor pricing |
| Home Depot | Building Materials | Construction supplies, tools |
| Lowe's | Building Materials | Hardware, appliances |
| Amazon | General | Home products, reviews |

### AI Model Stack

```
┌─────────────────────────────────────────────┐
│           VISTAVIEW AI STACK                │
├─────────────────────────────────────────────┤
│  🧠 Primary Model: gpt-oss:20b (13GB)       │
│  📊 Embeddings: nomic-embed-text (274MB)    │
│  👁️ Vision: llava (4.7GB)                   │
│  🚀 Fast Queries: llama3.1:8b (4.9GB)       │
├─────────────────────────────────────────────┤
│  Provider: Ollama (Local)                   │
│  Endpoint: http://localhost:11434           │
└─────────────────────────────────────────────┘
```

---

## 👥 User Roles (6 Types)

| Role | Description | Key Features |
|------|-------------|--------------|
| 🏠 **Buyer** | Looking to purchase property | Search, compare, save favorites |
| 🔑 **Renter** | Looking for rentals | Filter by price, location, amenities |
| 🏗️ **Builder** | Construction companies | Project management, material sourcing |
| 🏪 **Vendor** | Product/service sellers | Catalog management, order fulfillment |
| 🏢 **Agent** | Real estate professionals | Listing management, client tracking |
| 👨‍💼 **Admin** | Platform administrators | Full system access, analytics |

---

## 📊 Database Schema (39 Tables)

### Core Tables
```
accounts              - User accounts and authentication
auth_sessions         - Active login sessions
ai_memory            - AI learned patterns and memories
learning_sessions    - AI training session logs
training_stats       - Model performance metrics
```

### Content Tables
```
documents            - Uploaded files and documents
chunks               - Document chunks for RAG
embeddings           - Vector embeddings for search
```

### Marketplace Tables
```
vendors              - Vendor profiles
vendor_catalogs      - Product catalogs
products             - Individual products
product_images       - Product media
images               - General image storage
```

### Real Estate Tables
```
builders             - Builder company profiles
projects             - Construction projects
floors               - Building floor plans
units                - Individual units/apartments
properties           - Property listings
property_comparables - Market comparisons
```

### Market Intelligence
```
market_sources       - Data source configurations
market_prices        - Price data points
price_history        - Historical pricing
competitive_analysis - Competitor tracking
market_trends        - Trend analysis
ai_summaries         - AI-generated insights
```

### User Interaction
```
generated_pages      - Dynamic page content
services             - Service offerings
campaigns            - Marketing campaigns
user_sessions        - User activity tracking
interaction_events   - Click/action logs
conversation_history - Chat logs
voice_commands       - Voice interaction logs
```

### Analytics & Operations
```
daily_analytics      - Daily metrics
processing_jobs      - Background job queue
scrape_jobs          - Web scraping tasks
search_queries       - Search log
semantic_cache       - Query cache
notifications        - User notifications
price_alerts         - Price change alerts
```

---

## 🚀 Quick Start

### One-Click Setup (Fresh Install)

```bash
# Clone the repository
git clone https://github.com/vnvamshi/funnyvv.git ~/vistaview_WORKING
cd ~/vistaview_WORKING

# Make scripts executable
chmod +x vistaview.sh

# Run setup (installs everything automatically)
./vistaview.sh setup
```

### What Setup Does:
1. ✅ Checks Node.js, npm, Git, Ollama
2. ✅ Installs missing dependencies
3. ✅ Creates folder structure
4. ✅ Installs npm packages
5. ✅ Starts all services
6. ✅ Creates first version backup
7. ✅ Validates everything works

---

## 🌐 Service URLs

| Service | URL | Port | Description |
|---------|-----|------|-------------|
| 🖥️ Frontend | http://localhost:5200 | 5200 | Main web application |
| 📊 AI Dashboard | http://localhost:3006/dashboard | 3006 | Learning stats & monitoring |
| 🔌 Backend API | http://localhost:3005/api | 3005 | REST API endpoints |
| 🤖 Ollama | http://localhost:11434 | 11434 | LLM inference |

### API Endpoints

```bash
GET  /api/health          # Health check
GET  /api/stats           # AI statistics
GET  /api/memories        # Learned patterns
GET  /api/tables          # Database schema
GET  /api/team            # Team info
GET  /api/roles           # User roles
GET  /api/dashboard       # Dashboard data
POST /api/voice/process   # Process voice command
POST /api/query           # Query AI
```

---

## 📋 Commands Reference

### Service Management

```bash
./vistaview.sh start      # Start all services
./vistaview.sh stop       # Stop all services
./vistaview.sh restart    # Restart all services
./vistaview.sh status     # Check service status
```

### Version Control

```bash
./vistaview.sh backup "Description"    # Create version backup
./vistaview.sh versions                # List all versions
./vistaview.sh restore v1.0.5          # Restore specific version
```

### GitHub Sync

```bash
./vistaview.sh sync                    # Push to GitHub folder
./vistaview.sh restore-from-github     # Pull from GitHub
```

### System

```bash
./vistaview.sh setup      # Fresh install/setup
./vistaview.sh check      # Run sanity checks
./vistaview.sh archive    # Create local archive
./vistaview.sh help       # Show all commands
```

---

## 🎤 Voice Commands

| Say This | Mr. V Does |
|----------|-----------|
| "About us" | Opens team information |
| "How it works" | Shows platform tutorial |
| "Sign me up" | Opens registration |
| "I'm a vendor" | Starts vendor onboarding |
| "I'm a builder" | Starts builder onboarding |
| "Show properties" | Opens real estate listings |
| "Product catalog" | Opens marketplace |
| "Hey" / "Wait" | Pauses Mr. V |
| "Continue" | Resumes conversation |
| "Close" / "Exit" | Closes current modal |

---

## 📁 Folder Structure

```
vistaview_WORKING/
├── vistaview.sh              # 🎯 MASTER CONTROL SCRIPT
├── README.md                 # This file
├── package.json              # Frontend dependencies
├── .gitignore               # Git exclusions
├── .env.example             # Environment template
│
├── src/                     # Frontend source (React/Vite)
│   ├── components/          # React components
│   ├── pages/               # Page components
│   ├── routes/              # Routing
│   ├── utils/               # Utilities
│   └── v3/                  # Version 3 components
│
├── public/                  # Static assets
│   └── models/              # 3D GLB models
│
├── backend/                 # Backend server
│   ├── server.cjs           # Express API server
│   ├── learner.cjs          # Learning engine
│   └── package.json         # Backend dependencies
│
├── dashboard/               # AI Dashboard
│   ├── server.cjs           # Dashboard server
│   └── package.json         # Dashboard dependencies
│
├── data/                    # AI Data (CRITICAL)
│   ├── ai-data.json         # Main AI database
│   ├── team-members.json    # Team information
│   ├── user-roles.json      # Role definitions
│   └── landing-page-vectors.json
│
├── docs/                    # Documentation
│   ├── RUNBOOK.md           # Operations guide
│   ├── PORTS.md             # Port assignments
│   ├── CHANGELOG.md         # Version history
│   ├── LLM.md               # AI configuration
│   ├── EMERGENCY.md         # Emergency procedures
│   ├── TEAM.md              # Team guidelines
│   └── SECURITY.md          # Security practices
│
├── ops/                     # Operations
│   ├── scripts/             # Utility scripts
│   │   ├── backup.sh        # Backup script
│   │   ├── archive.sh       # Archive script
│   │   └── sync-to-github.sh
│   └── cron/                # Scheduled tasks
│
├── reports/                 # Daily AI reports
│   └── YYYY-MM-DD.md        # Daily reports
│
├── logs/                    # Service logs
│   ├── backend.log
│   ├── dashboard.log
│   ├── learner.log
│   ├── frontend.log
│   └── master.log
│
├── .versions/               # Local version backups (10)
│   └── v1.0.X_TIMESTAMP/    # Version snapshots
│
└── server/                  # Original server files
    └── learner.cjs
```

---

## 🆘 EMERGENCY PROCEDURES

### 🔴 If Everything Breaks

```bash
# Step 1: Stop everything
./vistaview.sh stop

# Step 2: Check what's wrong
./vistaview.sh check

# Step 3a: Restore from local version
./vistaview.sh versions              # List versions
./vistaview.sh restore v1.0.5        # Pick a working one

# Step 3b: OR restore from GitHub
./vistaview.sh restore-from-github

# Step 4: Restart
./vistaview.sh start
```

### 🔴 If GitHub is Down

```bash
# Use local archive
cd ~/vistaview_ARCHIVE
ls -la                               # Find latest archive
unzip vistaview_v1.0.5_20260103.zip -d ~/vistaview_WORKING
cd ~/vistaview_WORKING
./vistaview.sh setup
```

### 🔴 If Local Machine is Lost

```bash
# On new machine:
# 1. Install prerequisites
brew install node git

# 2. Install Ollama
curl -fsSL https://ollama.com/install.sh | sh
ollama pull gpt-oss:20b
ollama pull nomic-embed-text

# 3. Clone from GitHub
git clone https://github.com/vnvamshi/funnyvv.git ~/vistaview_WORKING

# 4. Setup
cd ~/vistaview_WORKING
./vistaview.sh setup
```

### 🔴 If AI Data is Corrupted

```bash
# Restore just the AI data from version
cp ~/.versions/v1.0.X_TIMESTAMP/data/ai-data.json ~/vistaview_WORKING/data/

# Restart backend
./vistaview.sh restart
```

---

## 🔒 SECURITY BEST PRACTICES

### ❌ Never Do This
- Never commit `.env` or `.env.local` files
- Never put passwords/tokens in scripts
- Never share GitHub tokens
- Never run as root
- Never disable firewall on production

### ✅ Always Do This
- Use `.env.example` as template
- Store secrets in environment variables
- Use GitHub Personal Access Tokens (not passwords)
- Keep local backups separate from cloud
- Review code before running scripts

### Secrets Management

```bash
# Create local secrets file (NEVER commit)
cat > ~/.vistaview_secrets << 'EOF'
export GITHUB_TOKEN=your_token_here
export DB_PASSWORD=your_password_here
export API_KEY=your_key_here
EOF

chmod 600 ~/.vistaview_secrets

# Load in scripts
source ~/.vistaview_secrets
```

### Firewall Rules (Production)

```bash
# Only expose necessary ports
sudo ufw allow 22/tcp     # SSH
sudo ufw allow 80/tcp     # HTTP
sudo ufw allow 443/tcp    # HTTPS
sudo ufw enable
```

---

## 👥 TEAM COLLABORATION GUIDE

### For New Team Members

1. **Get Access**
   - Request GitHub access from admin
   - Clone repo: `git clone https://github.com/vnvamshi/funnyvv.git`
   
2. **Setup Local**
   ```bash
   cd funnyvv
   ./vistaview.sh setup
   ```

3. **Development Workflow**
   ```bash
   # Before starting work
   ./vistaview.sh restore-from-github  # Get latest
   
   # Make changes...
   
   # After changes
   ./vistaview.sh backup "What I changed"
   ./vistaview.sh sync
   # Open GitHub Desktop → Commit → Push
   ```

### Branch Strategy

```
main           - Production ready code
├── develop    - Integration branch
├── feature/*  - New features
├── bugfix/*   - Bug fixes
└── hotfix/*   - Emergency fixes
```

### Code Review Checklist

- [ ] Does it work locally?
- [ ] Did you run `./vistaview.sh check`?
- [ ] Did you create a version backup?
- [ ] Did you update documentation?
- [ ] Did you test on fresh setup?

---

## ☁️ AWS/EC2 DEPLOYMENT (Plug & Play)

### For Your Team Building on AWS

The goal is **plug-and-play**: your team can deploy the AI features alongside their existing AWS infrastructure.

### Prerequisites on EC2

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Pull AI models
ollama pull gpt-oss:20b
ollama pull nomic-embed-text
```

### Deployment Script

```bash
# Clone and setup
git clone https://github.com/vnvamshi/funnyvv.git /opt/vistaview
cd /opt/vistaview
./vistaview.sh setup

# Create systemd services
sudo cat > /etc/systemd/system/vistaview.service << 'EOF'
[Unit]
Description=VistaView Services
After=network.target

[Service]
Type=forking
User=ubuntu
WorkingDirectory=/opt/vistaview
ExecStart=/opt/vistaview/vistaview.sh start
ExecStop=/opt/vistaview/vistaview.sh stop
Restart=always

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl enable vistaview
sudo systemctl start vistaview
```

### Integration Points

| VistaView Component | AWS Service | Integration |
|---------------------|-------------|-------------|
| AI Data | S3 | Backup ai-data.json to S3 |
| Logs | CloudWatch | Stream logs to CloudWatch |
| Frontend | CloudFront | CDN for static assets |
| API | API Gateway | Expose APIs securely |
| Database | RDS/PostgreSQL | Replace JSON with PostgreSQL |
| Models | EC2 GPU | Run Ollama on GPU instance |
| Storage | MinIO/S3 | Asset storage |

### Environment Variables for AWS

```bash
# /opt/vistaview/.env
AWS_REGION=us-east-1
S3_BUCKET=vistaview-data
RDS_HOST=vistaview.xxx.rds.amazonaws.com
RDS_PORT=5432
RDS_DATABASE=vistaview
REDIS_HOST=vistaview.xxx.cache.amazonaws.com
```

---

## 📊 AI STATS (Current)

| Metric | Value |
|--------|-------|
| **Total Interactions** | 2,208+ |
| **Learned Patterns** | 70+ |
| **Market Prices Learned** | 2,208+ |
| **Database Tables** | 39 |
| **Learning Sources** | 8 |
| **AI Model** | gpt-oss:20b |
| **Confidence Score** | 89.4% |
| **Learning Interval** | 30 seconds |

---

## 🔄 Version History

| Version | Date | Interactions | Changes |
|---------|------|--------------|---------|
| v1.0.0 | 2026-01-03 | 2,208 | Initial benchmark release |

---

## 🛠️ Troubleshooting

### Port Already in Use
```bash
lsof -ti:5200 | xargs kill -9  # Frontend
lsof -ti:3005 | xargs kill -9  # Backend
lsof -ti:3006 | xargs kill -9  # Dashboard
```

### Ollama Not Responding
```bash
ollama serve &
ollama list
```

### NPM Dependency Errors
```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### Reset Everything
```bash
./vistaview.sh stop
rm -rf node_modules
./vistaview.sh restore-from-github
./vistaview.sh setup
```

---

## 📞 Support

- **GitHub Issues**: https://github.com/vnvamshi/funnyvv/issues
- **Documentation**: See `/docs` folder
- **Emergency**: See EMERGENCY.md

---

## 👥 Team

| Name | Role | Responsibility |
|------|------|----------------|
| **Vamsi Velicheti** | Founder & CEO | Vision, Strategy |
| **Vikram** | Co-Founder & CTO | Technology, Architecture |
| **Sunita** | Co-Founder & COO | Operations, Business |

---

## 📄 License

Proprietary - VistaView Realty Services © 2026

---

*Last Updated: 2026-01-03*
*Generated by VistaView Master Control System*
