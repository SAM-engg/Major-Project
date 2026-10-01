import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mic, MicOff, Volume2, Loader2, User, Bot } from 'lucide-react';

const VoiceExpert = () => {
  const navigate = useNavigate();

  const [recording,       setRecording]       = useState(false);
  const [processing,      setProcessing]      = useState(false);
  const [transcription,   setTranscription]   = useState("");
  const [response,        setResponse]        = useState("");
  const [error,           setError]           = useState("");
  const [history,         setHistory]         = useState([]); // conversation log

  const mediaRecorderRef = useRef(null);
  const audioChunksRef   = useRef([]);
  const streamRef        = useRef(null);

  // Auto-speak response when it arrives
  useEffect(() => {
    if (response) {
      speakResponse(response);
    }
  }, [response]);

  // Cleanup mic stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  // ============================================================
  // TEXT-TO-SPEECH — reads reply aloud
  // ============================================================
  const speakResponse = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel(); // stop any previous speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate   = 0.95;
    utterance.pitch  = 1;
    utterance.volume = 1;
    // prefer a natural English voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v =>
      v.lang === "en-US" && v.name.toLowerCase().includes("google")
    ) || voices.find(v => v.lang === "en-US") || voices[0];
    if (preferred) utterance.voice = preferred;
    window.speechSynthesis.speak(utterance);
  };

  // ============================================================
  // START RECORDING
  // ============================================================
  const startRecording = async () => {
    try {
      setError("");
      setTranscription("");
      setResponse("");

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Use audio/webm with opus for best Whisper compatibility
      const options = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? { mimeType: "audio/webm;codecs=opus" }
        : {};

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current   = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.start(100); // collect chunks every 100ms
      setRecording(true);

    } catch (err) {
      console.error("Mic error:", err);
      setError("Microphone access denied. Please allow mic permission and try again.");
    }
  };

  // ============================================================
  // STOP RECORDING + SEND TO BACKEND
  // ============================================================
  const stopRecording = () => {
    if (!mediaRecorderRef.current) return;

    setRecording(false);
    setProcessing(true);

    mediaRecorderRef.current.stop();

    // Stop mic stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }

    mediaRecorderRef.current.onstop = async () => {
      try {
        const mimeType  = mediaRecorderRef.current.mimeType || "audio/webm";
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });

        if (audioBlob.size < 1000) {
          throw new Error("Recording too short — please hold the button and speak.");
        }

        const formData = new FormData();
        formData.append("audio", audioBlob, "voice.webm");

        const token = localStorage.getItem("token");
        const res   = await fetch("http://localhost:5000/api/expert/voice", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Server error");
        }

        const data = await res.json();

        setTranscription(data.transcribedText || "");
        setResponse(data.expertReply || "No response received.");

        // Add to history log
        setHistory(prev => [
          ...prev,
          { q: data.transcribedText, a: data.expertReply }
        ]);

      } catch (err) {
        console.error("Voice error:", err);
        setError(err.message || "Voice processing failed. Please try again.");
      } finally {
        setProcessing(false);
      }
    };
  };

  const toggleVoice = () => recording ? stopRecording() : startRecording();

  // ============================================================
  // UI
  // ============================================================
  return (
    <div className="min-h-screen bg-[#0B0F14] text-white p-6 flex flex-col items-center">
      <div className="w-full max-w-2xl">

        {/* Back */}
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-10 transition-colors"
        >
          <ArrowLeft size={20} /> Dashboard
        </button>

        {/* Mic Orb */}
        <div className="text-center mb-10">
          <div
            className={`w-36 h-36 mx-auto rounded-full flex items-center justify-center mb-6 transition-all duration-500 cursor-pointer
              ${recording
                ? "bg-red-500/20 shadow-[0_0_60px_rgba(239,68,68,0.4)] scale-110 border-2 border-red-500"
                : processing
                  ? "bg-purple-500/20 border-2 border-purple-500 animate-pulse"
                  : "bg-[#121826] border-2 border-[#1F2937] hover:border-purple-500"
              }`}
            onClick={toggleVoice}
          >
            {processing
              ? <Loader2 size={52} className="text-purple-400 animate-spin" />
              : recording
                ? <Mic size={52} className="text-red-400 animate-pulse" />
                : <MicOff size={52} className="text-gray-500" />
            }
          </div>

          <h1 className="text-4xl font-black mb-2">
            Voice <span className="text-[#7C3AED]">Expert</span>
          </h1>
          <p className="text-gray-400 text-sm max-w-sm mx-auto">
            {recording   ? "Listening... speak your question now"
            : processing ? "Transcribing and generating your answer..."
            : "Tap the mic or button below to ask FitAI anything"}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-4 rounded-2xl mb-6">
            ⚠️ {error}
          </div>
        )}

        {/* Transcription bubble */}
        {transcription && (
          <div className="flex justify-end mb-4">
            <div className="flex items-start gap-3 max-w-[85%]">
              <div className="bg-[#7C3AED] px-5 py-3 rounded-2xl rounded-tr-sm">
                <p className="text-xs text-purple-200 font-bold mb-1 uppercase tracking-wider">
                  You said
                </p>
                <p className="text-sm text-white">{transcription}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#7C3AED]/30 flex items-center justify-center shrink-0 mt-1">
                <User size={16} className="text-purple-300" />
              </div>
            </div>
          </div>
        )}

        {/* AI Response bubble */}
        {response && (
          <div className="flex justify-start mb-6">
            <div className="flex items-start gap-3 max-w-[85%]">
              <div className="w-8 h-8 rounded-full bg-[#1F2937] border border-[#7C3AED]/40 flex items-center justify-center shrink-0 mt-1">
                <Bot size={16} className="text-purple-400" />
              </div>
              <div className="bg-[#121826] border border-[#1F2937] px-5 py-4 rounded-2xl rounded-tl-sm">
                <p className="text-xs text-purple-400 font-bold mb-2 uppercase tracking-wider">
                  FitAI Coach
                </p>
                <p className="text-sm text-gray-200 leading-relaxed">{response}</p>
                <button
                  onClick={() => speakResponse(response)}
                  className="mt-3 flex items-center gap-1 text-xs text-gray-500 hover:text-purple-400 transition-colors"
                >
                  <Volume2 size={12} /> Play again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* History */}
        {history.length > 1 && (
          <div className="mt-4 space-y-4 max-h-64 overflow-y-auto pr-1">
            <p className="text-xs text-gray-600 uppercase tracking-widest font-bold">Previous Questions</p>
            {history.slice(0, -1).reverse().map((item, i) => (
              <div key={i} className="bg-[#121826] border border-[#1F2937] p-4 rounded-2xl">
                <p className="text-xs text-purple-400 font-bold mb-1">Q: {item.q}</p>
                <p className="text-xs text-gray-400">{item.a}</p>
              </div>
            ))}
          </div>
        )}

        {/* Main Button */}
        <button
          onClick={toggleVoice}
          disabled={processing}
          className={`w-full py-5 rounded-2xl font-black text-lg mt-8 transition-all uppercase tracking-widest
            ${processing
              ? "bg-gray-800 text-gray-500 cursor-not-allowed"
              : recording
                ? "bg-red-500/10 text-red-400 border-2 border-red-500"
                : "bg-[#7C3AED] text-white hover:bg-purple-500"
            }`}
        >
          {processing ? "Processing..." : recording ? "⏹ Stop Recording" : "🎙 Start Voice Query"}
        </button>

        {/* Tips */}
        <div className="mt-10 grid grid-cols-2 gap-4">
          {[
            "What should I eat after workout?",
            "How much protein do I need?",
            "Best exercises for chest?",
            "Is cardio good for fat loss?"
          ].map((tip, i) => (
            <div
              key={i}
              className="bg-[#121826] border border-[#1F2937] p-4 rounded-2xl text-xs text-gray-400 hover:border-purple-500/50 hover:text-white transition-all cursor-default"
            >
              💬 "{tip}"
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default VoiceExpert;