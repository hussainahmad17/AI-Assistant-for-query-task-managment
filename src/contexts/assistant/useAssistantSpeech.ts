
import { useState, useCallback } from "react";
import { AssistantSettings } from "./types";
import { cleanTextForSpeech } from "./utils";

export function useAssistantSpeech(settings: AssistantSettings | null) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speechSynthesis = typeof window !== 'undefined' ? window.speechSynthesis : undefined;

  const speakMessage = useCallback(
    (text: string) => {
      if (!settings?.voiceEnabled || !speechSynthesis) return;

      stopSpeaking();
      const cleanedText = cleanTextForSpeech(text);
      const utterance = new window.SpeechSynthesisUtterance(cleanedText);

      // Find the voice that matches the selected voice name
      if (settings) {
        const voices = speechSynthesis.getVoices();
        const voice = voices.find((v) => v.name === settings.selectedVoice)
          || voices.find((v) => v.lang.startsWith('en'))
          || null;
        if (voice) utterance.voice = voice;
        utterance.rate = settings.speechSpeed || 1;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      speechSynthesis.speak(utterance);
    },
    [settings, speechSynthesis]
  );

  const stopSpeaking = useCallback(() => {
    if (speechSynthesis) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [speechSynthesis]);

  return {
    isSpeaking,
    speakMessage,
    stopSpeaking,
  };
}
