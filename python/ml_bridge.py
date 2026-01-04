"""VistaView Python ML Bridge"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import hashlib
import os

app = Flask(__name__)
CORS(app)

def pseudo_embedding(text, dim=1536):
    h = hashlib.sha512(text.encode()).hexdigest()
    emb = [(int(h[i%64*2:i%64*2+2], 16)/255)*2-1 for i in range(dim)]
    mag = np.sqrt(sum(v**2 for v in emb))
    return [v/mag for v in emb]

@app.route('/health')
def health():
    return jsonify({'status': 'ok', 'embedder': 'pseudo'})

@app.route('/embed', methods=['POST'])
def embed():
    text = request.json.get('text', '')
    if not text: return jsonify({'error': 'text required'}), 400
    return jsonify({'embedding': pseudo_embedding(text), 'dimension': 1536})

@app.route('/similarity', methods=['POST'])
def similarity():
    t1, t2 = request.json.get('text1', ''), request.json.get('text2', '')
    e1, e2 = np.array(pseudo_embedding(t1)), np.array(pseudo_embedding(t2))
    sim = float(np.dot(e1, e2) / (np.linalg.norm(e1) * np.linalg.norm(e2)))
    return jsonify({'similarity': sim})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
