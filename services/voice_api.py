"""
VistaView Voice API Service
Using: Whisper (STT), macOS say/Piper (TTS), sentence-transformers (embeddings)

Endpoints:
  POST /stt - Speech to text (accepts audio file)
  POST /tts - Text to speech (returns audio)
  POST /embed - Generate embedding for text
  POST /process - Full voice processing pipeline
  GET /health - Health check
"""

import os
import io
import json
import tempfile
import subprocess
from typing import Optional
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
import psycopg2
from datetime import datetime

app = FastAPI(title="VistaView Voice API", version="1.0")

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5180", "http://localhost:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ═══════════════════════════════════════════════════════════════════════════════
# LOAD MODELS
# ═══════════════════════════════════════════════════════════════════════════════
print("[Voice API] Loading models...")

# Whisper for STT
whisper_model = None
try:
    import whisper
    whisper_model = whisper.load_model("base")
    print("[Voice API] ✅ Whisper loaded (base model)")
except Exception as e:
    print(f"[Voice API] ⚠️ Whisper not available: {e}")

# Sentence transformers for embeddings
embedding_model = None
try:
    from sentence_transformers import SentenceTransformer
    embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
    print("[Voice API] ✅ Sentence-transformers loaded (384 dim)")
except Exception as e:
    print(f"[Voice API] ⚠️ Embeddings not available: {e}")

# Database connection
def get_db():
    return psycopg2.connect(
        database="vistaview",
        host="localhost"
    )

# ═══════════════════════════════════════════════════════════════════════════════
# ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════════════

@app.get("/health")
async def health():
    return {
        "status": "ok",
        "whisper": whisper_model is not None,
        "embeddings": embedding_model is not None,
        "timestamp": datetime.now().isoformat()
    }

@app.post("/stt")
async def speech_to_text(audio: UploadFile = File(...)):
    """Convert audio to text using Whisper"""
    if not whisper_model:
        raise HTTPException(500, "Whisper not available")
    
    # Save uploaded audio to temp file
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
        content = await audio.read()
        tmp.write(content)
        tmp_path = tmp.name
    
    try:
        result = whisper_model.transcribe(tmp_path)
        text = result["text"].strip()
        
        return {
            "success": True,
            "text": text,
            "language": result.get("language", "en")
        }
    finally:
        os.unlink(tmp_path)

@app.post("/tts")
async def text_to_speech(text: str, voice: str = "default"):
    """Convert text to speech"""
    output_path = tempfile.mktemp(suffix=".aiff")
    
    try:
        # Use macOS say command (always available)
        subprocess.run(
            ["say", "-o", output_path, text],
            check=True,
            capture_output=True
        )
        return FileResponse(output_path, media_type="audio/aiff")
    except Exception as e:
        raise HTTPException(500, f"TTS failed: {e}")

@app.post("/embed")
async def generate_embedding(text: str):
    """Generate embedding for text"""
    if not embedding_model:
        raise HTTPException(500, "Embedding model not available")
    
    embedding = embedding_model.encode(text).tolist()
    return {
        "success": True,
        "embedding": embedding,
        "dimensions": len(embedding)
    }

@app.post("/process")
async def process_voice(
    text: str,
    user_type: str = "boss",
    page_route: str = "/"
):
    """
    Full voice processing pipeline:
    1. Analyze intent/sentiment
    2. Generate embedding
    3. Save to database
    4. Generate response
    5. Return TTS audio
    """
    try:
        conn = get_db()
        cur = conn.cursor()
        
        # Simple intent detection
        text_lower = text.lower()
        if any(w in text_lower for w in ["navigate", "go to", "open", "show"]):
            intent = "navigation"
        elif any(w in text_lower for w in ["search", "find", "look for"]):
            intent = "query"
        elif any(w in text_lower for w in ["stop", "cancel", "close"]):
            intent = "control"
        else:
            intent = "general"
        
        # Simple sentiment
        if any(w in text_lower for w in ["great", "good", "awesome", "thanks"]):
            sentiment = "positive"
        elif any(w in text_lower for w in ["bad", "wrong", "error", "hate"]):
            sentiment = "negative"
        else:
            sentiment = "neutral"
        
        # Generate embedding
        embedding = None
        if embedding_model:
            embedding = embedding_model.encode(text).tolist()
        
        # Save to database
        cur.execute("""
            INSERT INTO global_interaction_ledger 
            (user_type, raw_transcript, intent, sentiment, page_route, created_at)
            VALUES (%s, %s, %s, %s, %s, NOW())
            RETURNING id
        """, (user_type, text, intent, sentiment, page_route))
        ledger_id = cur.fetchone()[0]
        
        # Save to boss_commands with embedding
        if embedding:
            cur.execute("""
                INSERT INTO boss_commands 
                (raw_transcript, intent, page_context, embedding, created_at)
                VALUES (%s, %s, %s, %s, NOW())
                RETURNING id
            """, (text, intent, page_route, embedding))
        
        # Update learned patterns
        cur.execute("""
            INSERT INTO learned_patterns (pattern_text, pattern_type, occurrence_count, last_seen)
            VALUES (%s, %s, 1, NOW())
            ON CONFLICT (pattern_text) 
            DO UPDATE SET occurrence_count = learned_patterns.occurrence_count + 1, last_seen = NOW()
        """, (text.lower()[:100], intent))
        
        conn.commit()
        cur.close()
        conn.close()
        
        # Generate response based on intent
        responses = {
            "navigation": f"Navigating you there right now, boss!",
            "query": f"Let me search for that information.",
            "control": f"Done! Action completed.",
            "general": f"Got it! I'm processing your request."
        }
        response_text = responses.get(intent, "I hear you, boss!")
        
        return {
            "success": True,
            "ledger_id": ledger_id,
            "analysis": {
                "intent": intent,
                "sentiment": sentiment,
                "hasEmbedding": embedding is not None
            },
            "response": {
                "text": response_text,
                "tone": "friendly"
            }
        }
        
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": str(e)}
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
