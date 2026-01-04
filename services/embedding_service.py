"""
Embedding Service - Generate embeddings for pgvector
Uses sentence-transformers or Ollama nomic-embed-text
"""

import os
import json
import psycopg2
from typing import List, Optional

# Try sentence-transformers first, fallback to ollama
try:
    from sentence_transformers import SentenceTransformer
    model = SentenceTransformer('all-MiniLM-L6-v2')  # 384 dimensions
    USE_LOCAL = True
    print("[Embedding] Using sentence-transformers (local)")
except ImportError:
    USE_LOCAL = False
    import subprocess
    print("[Embedding] Using Ollama nomic-embed-text")

def get_embedding(text: str) -> List[float]:
    """Generate embedding for text"""
    if USE_LOCAL:
        return model.encode(text).tolist()
    else:
        # Use Ollama
        result = subprocess.run(
            ['ollama', 'embeddings', 'nomic-embed-text', text],
            capture_output=True, text=True
        )
        return json.loads(result.stdout)['embedding']

def embed_boss_commands():
    """Add embeddings to boss_commands table"""
    conn = psycopg2.connect(database='vistaview')
    cur = conn.cursor()
    
    # Get commands without embeddings
    cur.execute("SELECT id, raw_transcript FROM boss_commands WHERE embedding IS NULL")
    rows = cur.fetchall()
    
    print(f"[Embedding] Processing {len(rows)} commands...")
    
    for row in rows:
        cmd_id, text = row
        try:
            embedding = get_embedding(text)
            cur.execute(
                "UPDATE boss_commands SET embedding = %s WHERE id = %s",
                (embedding, cmd_id)
            )
            print(f"  ✅ Embedded command {cmd_id}")
        except Exception as e:
            print(f"  ❌ Error on {cmd_id}: {e}")
    
    conn.commit()
    cur.close()
    conn.close()
    print("[Embedding] Done!")

if __name__ == '__main__':
    embed_boss_commands()
