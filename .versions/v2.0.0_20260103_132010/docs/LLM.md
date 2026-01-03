# VistaView LLM Configuration

## Current Model
- **Name:** gpt-oss:20b
- **Provider:** Ollama (local)
- **Endpoint:** http://localhost:11434

## Available Models
```bash
ollama list
```
| Model | Size | Purpose |
|-------|------|---------|
| gpt-oss:20b | 13 GB | Main inference |
| llama3.1:8b | 4.9 GB | Backup/fast queries |
| nomic-embed-text | 274 MB | Embeddings |
| llava | 4.7 GB | Vision tasks |

## API Usage
```bash
# Generate response
curl http://localhost:11434/api/generate -d '{
  "model": "gpt-oss:20b",
  "prompt": "What is VistaView?",
  "stream": false
}'

# Create embedding
curl http://localhost:11434/api/embeddings -d '{
  "model": "nomic-embed-text",
  "prompt": "Property listing in Dallas"
}'
```

## Prompts Location
System prompts are stored in:
- `data/prompts/` (if using file-based)
- Database `prompts` table (if using DB)

## Training/Fine-tuning
The learning engine in `backend/learner.cjs`:
- Runs every 30 seconds
- Crawls 8 sources (Zillow, Redfin, IKEA, etc.)
- Stores patterns in `data/ai-data.json`
- Updates confidence scores

## Import to Cloud
To migrate prompts to cloud LLM:
1. Export from `data/ai-data.json`
2. Convert to provider format (OpenAI, Anthropic, etc.)
3. Import via provider's fine-tuning API
