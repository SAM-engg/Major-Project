
# stt-ai-service/app.py
# FitAI Speech-to-Text Service
# Flask + OpenAI Whisper + FFmpeg
# Designed for local development and Render deployment

import os
import shutil
import tempfile
import time
import traceback

from flask import Flask, request, jsonify
from flask_cors import CORS
from pydub import AudioSegment
import whisper


# ============================================================
# FLASK APP CONFIGURATION
# ============================================================

app = Flask(__name__)
CORS(app)

# Limit uploaded audio size to 20 MB.
app.config["MAX_CONTENT_LENGTH"] = 20 * 1024 * 1024


# ============================================================
# FFMPEG CONFIGURATION
# Works on Windows and Linux, including Render.
# ============================================================

ffmpeg_path = shutil.which("ffmpeg")
ffprobe_path = shutil.which("ffprobe")

if not ffmpeg_path or not ffprobe_path:
    raise RuntimeError(
        "FFmpeg and FFprobe were not found. "
        "Install FFmpeg and make sure both commands are on PATH."
    )

AudioSegment.converter = ffmpeg_path
AudioSegment.ffmpeg = ffmpeg_path
AudioSegment.ffprobe = ffprobe_path

print(f"FFmpeg: {ffmpeg_path}")
print(f"FFprobe: {ffprobe_path}")


# ============================================================
# LOAD WHISPER MODEL ONCE AT STARTUP
# ============================================================

MODEL_NAME = os.getenv("WHISPER_MODEL", "base")

print(f"Loading Whisper model: {MODEL_NAME} ...")
whisper_model = whisper.load_model(MODEL_NAME)
print("Whisper model loaded successfully.")


# ============================================================
# HELPER: SAFELY DELETE TEMPORARY FILES
# ============================================================

def safe_delete(path):
    for _ in range(3):
        try:
            if path and os.path.exists(path):
                os.remove(path)
            return
        except OSError:
            time.sleep(0.3)


# ============================================================
# ROOT ENDPOINT
# ============================================================

@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "service": "FitAI Speech-to-Text API",
        "status": "running",
        "health_endpoint": "/health",
        "transcription_endpoint": "/stt"
    })


# ============================================================
# HEALTH CHECK
# GET /health
# ============================================================

@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "model": f"whisper-{MODEL_NAME}",
        "engine": "openai-whisper"
    }), 200


# ============================================================
# SPEECH-TO-TEXT ENDPOINT
# POST /stt
# Expects multipart/form-data with field name "audio".
# Returns: {"text": "recognized words"}
# ============================================================

@app.route("/stt", methods=["POST"])
def transcribe_audio():
    input_path = None
    output_path = None

    try:
        # 1. Validate uploaded audio
        if "audio" not in request.files:
            return jsonify({
                "error": "No audio file provided. Use the form field 'audio'."
            }), 400

        audio_file = request.files["audio"]

        if not audio_file.filename:
            return jsonify({"error": "Empty audio filename."}), 400

        # 2. Save uploaded audio to a temporary file
        with tempfile.NamedTemporaryFile(
            suffix=".webm",
            delete=False
        ) as input_file:
            input_path = input_file.name
            audio_file.save(input_path)

        file_size = os.path.getsize(input_path)
        print(f"Received audio: {file_size} bytes")

        if file_size < 1500:
            return jsonify({
                "error": "Recording is too short. Please speak clearly and try again."
            }), 400

        # 3. Convert the audio to mono, 16 kHz WAV
        with tempfile.NamedTemporaryFile(
            suffix=".wav",
            delete=False
        ) as output_file:
            output_path = output_file.name

        sound = AudioSegment.from_file(input_path)
        sound = sound.set_channels(1)
        sound = sound.set_frame_rate(16000)
        sound.export(output_path, format="wav")

        print("Audio conversion completed.")

        # 4. Transcribe using Whisper
        result = whisper_model.transcribe(
            output_path,
            language="en",
            fp16=False,
            temperature=0.0,
            best_of=1,
            condition_on_previous_text=False,
            no_speech_threshold=0.6,
            logprob_threshold=-1.0,
            compression_ratio_threshold=2.4
        )

        recognized_text = result.get("text", "").strip()
        print(f"Transcription: {recognized_text!r}")

        # 5. Validate transcription
        if not recognized_text or len(recognized_text.split()) < 3:
            return jsonify({
                "error": "Could not detect clear speech. Please speak louder and try again."
            }), 400

        return jsonify({"text": recognized_text}), 200

    except Exception as error:
        print(f"STT error: {error}")
        traceback.print_exc()

        return jsonify({
            "error": "Transcription failed. Please try again."
        }), 500

    finally:
        safe_delete(input_path)
        safe_delete(output_path)


# ============================================================
# HANDLE LARGE UPLOADS
# ============================================================

@app.errorhandler(413)
def file_too_large(_error):
    return jsonify({
        "error": "Audio file is too large. Maximum size is 20 MB."
    }), 413


# ============================================================
# LOCAL DEVELOPMENT
# Render runs this application using Gunicorn.
# ============================================================

if __name__ == "__main__":
    port = int(os.getenv("PORT", "5001"))
    app.run(host="0.0.0.0", port=port, debug=False)
