
import { useEffect, useRef, useState } from "react";

export function useAssistantRecognition(
  onResult: (transcript: string) => void,
  onError: (error: string) => void,
  onEnd: () => void
) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      recognitionRef.current = null;
      return;
    }
    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = false;

    rec.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };
    rec.onerror = (event: any) => {
      onError(event.error);
    };
    rec.onend = () => {
      setIsListening(false);
      onEnd();
    };

    recognitionRef.current = rec;
  }, [onResult, onError, onEnd]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };
  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  return { isListening, startListening, stopListening };
}
