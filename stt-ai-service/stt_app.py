# Filename: stt_app.py
# STT Service using OpenAI Whisper (local, offline, accurate)

from flask import Flask, request, jsonify
from flask_cors import CORS
from pydub import AudioSegment
import whisper
import os
import tempfile
import time
import traceback

# ============================================================
# FFMPEG PATHS
# ============================================================
FFMPEG_DIR = r"C:\Users\samya\Downloads\ffmpeg-8.1-essentials_build\ffmpeg-8.1-essentials_build\bin"

AudioSegment.converter = os.path.join(FFMPEG_DIR, "ffmpeg.exe")
AudioSegment.ffmpeg    = os.path.join(FFMPEG_DIR, "ffmpeg.exe")
AudioSegment.ffprobe   = os.path.join(FFMPEG_DIR, "ffprobe.exe")

os.environ["PATH"]          += os.pathsep + FFMPEG_DIR
os.environ["FFMPEG_BINARY"]  = AudioSegment.ffmpeg
os.environ["FFPROBE_BINARY"] = AudioSegment.ffprobe

print(f"✅ FFmpeg  : {AudioSegment.ffmpeg}")
print(f"✅ FFprobe : {AudioSegment.ffprobe}")

# ============================================================
# LOAD WHISPER MODEL ONCE at startup
# ============================================================
print("⏳ Loading Whisper model...")
whisper_model = whisper.load_model("base")
print("✅ Whisper model loaded — ready to transcribe")

app = Flask(__name__)
CORS(app)


# ============================================================
# HELPER — safe temp file delete with retry
# ============================================================
def safe_delete(path):
    for _ in range(3):
        try:
            if path and os.path.exists(path):
                os.remove(path)
            return
        except Exception:
            time.sleep(0.3)


# ============================================================
# /stt  POST — receives audio blob, returns transcribed text
# ============================================================
@app.route("/stt", methods=["POST"])
def transcribe_audio():
    input_path  = None
    output_path = None

    try:
        # ── 1. Validate request
        if "audio" not in request.files:
            return jsonify({"error": "No audio file provided"}), 400

        audio_file = request.files["audio"]

        if audio_file.filename == "":
            return jsonify({"error": "Empty audio file"}), 400

        # ── 2. Save uploaded file to input temp file
        with tempfile.NamedTemporaryFile(suffix=".webm", delete=False) as inp:
            input_path = inp.name
            audio_file.save(input_path)

        # Guard: reject suspiciously small recordings
        file_size = os.path.getsize(input_path)
        print(f"📦 Received audio: {file_size} bytes")

        if file_size < 1500:
            return jsonify({
                "error": "Recording too short. Hold the button and speak clearly."
            }), 400

        # ── 3. Convert to 16kHz mono WAV (Whisper requirement)
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as out:
            output_path = out.name

        sound = AudioSegment.from_file(input_path)
        sound = sound.set_channels(1)       # mono
        sound = sound.set_frame_rate(16000) # 16kHz — Whisper native rate
        sound.export(output_path, format="wav")

        print(f"🎵 Converted to WAV: {output_path}")

        # ── 4. Transcribe with Whisper
        result = whisper_model.transcribe(
            output_path,
            language="en",
            fp16=False,
            temperature=0.0,
            best_of=1,
            condition_on_previous_text=False,
            no_speech_threshold=0.6,          # ignores low-confidence audio
            logprob_threshold=-1.0,           # filters noise transcriptions
            compression_ratio_threshold=2.4
        )

        text = result.get("text", "").strip()
        print(f"✅ Transcribed: '{text}'")

        # Reject noise artifacts (too short = not real speech)
        if not text or len(text.split()) < 3:
            return jsonify({
                "error": "Could not detect clear speech. Please speak louder and try again."
            }), 400

        return jsonify({"text": text})

    except Exception as e:
        print(f"❌ STT Error: {e}")
        traceback.print_exc()
        return jsonify({"error": f"Transcription failed: {str(e)}"}), 500

    finally:
        # Always clean up both temp files
        safe_delete(input_path)
        safe_delete(output_path)


# ============================================================
# HEALTH CHECK
# ============================================================
@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "model":  "whisper-base",
        "engine": "openai-whisper"
    })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=False)