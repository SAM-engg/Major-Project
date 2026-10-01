import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Mic, MicOff, Volume2, VolumeX,
  Loader2, User, Bot, Square, Send
} from "lucide-react";

const VoiceExpert = () => {
  const navigate = useNavigate();

  const [recording,     setRecording]     = useState(false);
  const [processing,    setProcessing]    = useState(false);
  const [transcription, setTranscription] = useState("");
  const [response,      setResponse]      = useState("");
  const [error,         setError]         = useState("");
  const [isSpeaking,    setIsSpeaking]    = useState(false);
  const [autoSpeak,     setAutoSpeak]     = useState(false);
  const [history,       setHistory]       = useState([]);
  const [textInput,     setTextInput]     = useState("");   // text mode input

  const mediaRecorderRef = useRef(null);
  const audioChunksRef   = useRef([]);
  const streamRef        = useRef(null);
  const bottomRef        = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, response]);

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  // ── Auto-speak when response arrives and toggle is ON ──
  useEffect(() => {
    if (response && autoSpeak) speakText(response);
  }, [response]);

  // ============================================================
  // TEXT TO SPEECH
  // ============================================================
  const speakText = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate   = 0.95;
    utt.pitch  = 1;
    utt.volume = 1;
    const voices   = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => v.lang === "en-US" && v.name.includes("Google"))
                   || voices.find(v => v.lang === "en-US")
                   || voices[0];
    if (preferred) utt.voice = preferred;
    utt.onstart = () => setIsSpeaking(true);
    utt.onend   = () => setIsSpeaking(false);
    utt.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utt);
  };

  const stopSpeaking = () => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  };

  // ============================================================
  // HANDLE AI RESPONSE (shared by voice + text input)
  // ============================================================
  const handleAIResponse = (questionText, replyText) => {
    setTranscription(questionText);
    setResponse(replyText);
    setHistory(prev => [{ q: questionText, a: replyText }, ...prev.slice(0, 9)]);
    setError("");
  };

  // ============================================================
  // TEXT INPUT SUBMIT
  // ============================================================
  const handleTextSubmit = async () => {
    const question = textInput.trim();
    if (!question || processing) return;

    setTextInput("");
    setProcessing(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      // Use chat endpoint for text queries
      const res = await fetch("http://localhost:5000/api/expert/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ message: question })
      });

      if (!res.ok) throw new Error("Server error");
      const data = await res.json();
      handleAIResponse(question, data.reply || "No response.");

    } catch (err) {
      setError("Could not get response. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  // ============================================================
  // VOICE RECORDING
  // ============================================================
  const startRecording = async () => {
    try {
      setError("");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const options = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? { mimeType: "audio/webm;codecs=opus" } : {};
      const recorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current   = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      recorder.start(100);
      setRecording(true);
    } catch {
      setError("Microphone access denied. Allow mic permission and try again.");
    }
  };

  const stopRecording = () => {
    setRecording(false);
    setProcessing(true);
    mediaRecorderRef.current?.stop();
    streamRef.current?.getTracks().forEach(t => t.stop());

    mediaRecorderRef.current.onstop = async () => {
      try {
        const mime     = mediaRecorderRef.current.mimeType || "audio/webm";
        const blob     = new Blob(audioChunksRef.current, { type: mime });
        if (blob.size < 1500) throw new Error("Recording too short. Please hold and speak.");

        const form = new FormData();
        form.append("audio", blob, "voice.webm");

        const token = localStorage.getItem("token");
        const res   = await fetch("http://localhost:5000/api/expert/voice", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: form
        });

        if (!res.ok) {
          const e = await res.json();
          throw new Error(e.error || "Server error");
        }

        const data = await res.json();
        handleAIResponse(data.transcribedText, data.expertReply);

      } catch (err) {
        setError(err.message || "Voice failed. Try again or use text input.");
      } finally {
        setProcessing(false);
      }
    };
  };

  const toggleRecording = () => recording ? stopRecording() : startRecording();

  // ============================================================
  // UI
  // ============================================================
  return (
    <div className="min-h-screen bg-[#0B0F14] text-white flex flex-col">

      {/* Header */}
      <div className="p-5 border-b border-[#1F2937] bg-[#121826] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/dashboard")} className="text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="w-9 h-9 rounded-full bg-[#7C3AED]/20 border border-[#7C3AED]/40 flex items-center justify-center">
            <Mic size={16} className="text-[#7C3AED]" />
          </div>
          <div>
            <h1 className="text-base font-black">Voice Expert</h1>
            <p className="text-[10px] text-green-400 font-bold">● AI Powered</p>
          </div>
        </div>

        {/* Auto-speak toggle */}
        <button
          onClick={() => setAutoSpeak(p => !p)}
          className={`flex items-center gap-2 text-xs px-3 py-2 rounded-xl border transition-all
            ${autoSpeak
              ? "bg-[#7C3AED]/20 border-[#7C3AED] text-purple-300"
              : "bg-[#121826] border-[#1F2937] text-gray-500"
            }`}
        >
          {autoSpeak ? <Volume2 size={14}/> : <VolumeX size={14}/>}
          {autoSpeak ? "Auto-speak ON" : "Auto-speak OFF"}
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-grow p-5 overflow-y-auto space-y-4">

        {/* Intro card */}
        {history.length === 0 && !processing && (
          <div className="text-center py-10">
            <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-5 cursor-pointer transition-all duration-500
              ${recording
                ? "bg-red-500/20 border-2 border-red-500 shadow-[0_0_40px_rgba(239,68,68,0.3)]"
                : "bg-[#121826] border-2 border-[#1F2937] hover:border-[#7C3AED]"
              }`}
              onClick={toggleRecording}
            >
              {recording
                ? <Mic size={40} className="text-red-400 animate-pulse"/>
                : <MicOff size={40} className="text-gray-500"/>
              }
            </div>
            <p className="text-gray-400 text-sm mb-6">
              Tap mic to speak, or type your fitness question below
            </p>
            <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
              {["What should I eat after workout?","How much protein do I need?","Best exercises for chest?","Is cardio good for fat loss?"]
                .map((tip, i) => (
                <button
                  key={i}
                  onClick={() => setTextInput(tip)}
                  className="bg-[#121826] border border-[#1F2937] p-3 rounded-xl text-xs text-gray-400 hover:border-[#7C3AED] hover:text-white text-left transition-all"
                >
                  💬 {tip}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Processing indicator */}
        {processing && (
          <div className="flex justify-center py-6">
            <div className="flex items-center gap-3 bg-[#121826] border border-[#1F2937] px-6 py-4 rounded-2xl">
              <Loader2 size={20} className="text-purple-400 animate-spin"/>
              <span className="text-sm text-gray-300">
                {recording ? "Processing audio..." : "Thinking..."}
              </span>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-4 rounded-2xl">
            ⚠️ {error}
          </div>
        )}

        {/* Current Q&A */}
        {transcription && response && (
          <div className="space-y-3">
            {/* User question bubble */}
            <div className="flex justify-end gap-3">
              <div className="max-w-[80%] bg-[#7C3AED] px-5 py-3 rounded-2xl rounded-br-sm">
                <p className="text-xs text-purple-200 font-bold mb-1">YOU</p>
                <p className="text-sm">{transcription}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#7C3AED]/30 flex items-center justify-center shrink-0 mt-1">
                <User size={14} className="text-purple-300"/>
              </div>
            </div>

            {/* AI response bubble */}
            <div className="flex justify-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#1F2937] border border-[#7C3AED]/40 flex items-center justify-center shrink-0 mt-1">
                <Bot size={14} className="text-[#7C3AED]"/>
              </div>
              <div className="max-w-[80%] bg-[#121826] border border-[#1F2937] px-5 py-4 rounded-2xl rounded-tl-sm">
                <p className="text-xs text-purple-400 font-bold mb-2">FITAI COACH</p>

                {/* Render bullets if present */}
                <div className="space-y-1">
                  {response.split("\n").filter(l => l.trim()).map((line, i) => {
                    const isBullet = line.trim().startsWith("•") || line.trim().startsWith("-");
                    return isBullet ? (
                      <div key={i} className="flex gap-2">
                        <span className="text-purple-400 shrink-0">•</span>
                        <span className="text-sm text-gray-200">{line.replace(/^[•\-]\s*/,"")}</span>
                      </div>
                    ) : (
                      <p key={i} className={`text-sm ${i === response.split("\n").filter(l=>l.trim()).length-1 ? "text-purple-400 font-bold mt-2 pt-2 border-t border-gray-700" : "text-gray-200"}`}>
                        {line.trim()}
                      </p>
                    );
                  })}
                </div>

                {/* Speak controls */}
                <div className="flex items-center gap-3 mt-4 pt-3 border-t border-[#1F2937]">
                  {isSpeaking ? (
                    <button
                      onClick={stopSpeaking}
                      className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Square size={12} fill="currentColor"/> Stop Speaking
                    </button>
                  ) : (
                    <button
                      onClick={() => speakText(response)}
                      className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-purple-400 transition-colors"
                    >
                      <Volume2 size={12}/> Hear Response
                    </button>
                  )}
                  <span className="text-[10px] text-gray-600">
                    {isSpeaking ? "Speaking..." : "Click to listen"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* History */}
        {history.length > 1 && (
          <div className="mt-6 border-t border-[#1F2937] pt-6 space-y-3">
            <p className="text-xs text-gray-600 uppercase tracking-widest font-bold">Previous</p>
            {history.slice(1).map((item, i) => (
              <div key={i} className="bg-[#121826] border border-[#1F2937] p-4 rounded-2xl">
                <p className="text-xs text-purple-400 font-bold mb-1">Q: {item.q}</p>
                <p className="text-xs text-gray-400 leading-relaxed">{item.a.slice(0, 120)}...</p>
              </div>
            ))}
          </div>
        )}

        <div ref={bottomRef}/>
      </div>

      {/* Bottom Controls */}
      <div className="p-4 bg-[#121826] border-t border-[#1F2937]">
        {/* Text input row */}
        <div className="flex gap-3 mb-3">
          <input
            className="flex-grow bg-[#0B0F14] border border-[#1F2937] rounded-2xl px-4 py-3 text-sm outline-none focus:border-[#7C3AED] transition-colors placeholder-gray-600"
            placeholder="Type your fitness question..."
            value={textInput}
            onChange={e => setTextInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") handleTextSubmit(); }}
            disabled={processing || recording}
          />
          <button
            onClick={handleTextSubmit}
            disabled={!textInput.trim() || processing || recording}
            className={`p-3 rounded-2xl transition-all
              ${!textInput.trim() || processing || recording
                ? "bg-gray-800 text-gray-600 cursor-not-allowed"
                : "bg-[#7C3AED] text-white hover:bg-purple-500"
              }`}
          >
            {processing ? <Loader2 size={20} className="animate-spin"/> : <Send size={20}/>}
          </button>
        </div>

        {/* Voice button */}
        <button
          onClick={toggleRecording}
          disabled={processing}
          className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all
            ${processing
              ? "bg-gray-800 text-gray-500 cursor-not-allowed"
              : recording
                ? "bg-red-500/10 text-red-400 border-2 border-red-500"
                : "bg-[#121826] border-2 border-[#1F2937] text-gray-300 hover:border-[#7C3AED]"
            }`}
        >
          {processing ? "Processing..." : recording ? "⏹ Stop Recording" : "🎙 Tap to Speak"}
        </button>
      </div>
    </div>
  );
};

export default VoiceExpert;