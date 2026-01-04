"""
Voice Service - Whisper STT + Piper TTS
"""

import os
import tempfile
import subprocess
from typing import Optional

def speech_to_text(audio_path: str) -> str:
    """Convert audio to text using Whisper"""
    try:
        import whisper
        model = whisper.load_model("base")
        result = model.transcribe(audio_path)
        return result["text"]
    except ImportError:
        # Fallback to whisper CLI
        result = subprocess.run(
            ['whisper', audio_path, '--output_format', 'txt'],
            capture_output=True, text=True
        )
        return result.stdout.strip()

def text_to_speech(text: str, output_path: Optional[str] = None) -> str:
    """Convert text to speech using Piper"""
    if not output_path:
        output_path = tempfile.mktemp(suffix='.wav')
    
    try:
        # Try piper-tts
        subprocess.run(
            ['piper', '--model', 'en_US-lessac-medium', '--output_file', output_path],
            input=text.encode(),
            check=True
        )
    except Exception as e:
        print(f"[TTS] Piper failed: {e}, using say command")
        # Fallback to macOS say
        subprocess.run(['say', '-o', output_path, text])
    
    return output_path

if __name__ == '__main__':
    # Test
    print(speech_to_text.__doc__)
    print(text_to_speech.__doc__)
