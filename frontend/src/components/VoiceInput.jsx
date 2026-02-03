"use client";

import { useEffect, useState } from 'react';

export default function VoiceInput({ onResult }) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.SpeechRecognition && !window.webkitSpeechRecognition) {
      setSupported(false);
    }
  }, []);

  const start = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return setSupported(false);
    const sr = new SpeechRecognition();
    sr.lang = 'en-US';
    sr.interimResults = false;
    sr.onresult = (e) => {
      const text = e.results[0][0].transcript;
      onResult(text);
    };
    sr.onend = () => setListening(false);
    sr.onerror = () => setListening(false);
    sr.start();
    setListening(true);
  };

  const stop = () => {
    // there's no standard stop handle here, we rely on instance end
    setListening(false);
  };

  if (!supported) return null;

  return (
    <div>
      <button onClick={() => (listening ? stop() : start())} className={`px-3 py-2 rounded ${listening ? 'bg-red-600 text-white' : 'bg-gray-100'}`}>
        {listening ? 'Listening...' : '🎙️ Speak'}
      </button>
    </div>
  );
}
