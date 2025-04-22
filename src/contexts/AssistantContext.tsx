
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { loadGlobalSettings } from '@/utils/globalSettings';
import { useHistory } from '@/contexts/HistoryContext';

interface AssistantContextType {
  messages: Message[];
  addMessage: (content: string, role: 'user' | 'assistant') => void;
  isProcessing: boolean;
  sendMessage: (content: string) => Promise<void>;
  clearConversation: () => void;
  apiKey: string | null;
  setApiKey: (key: string) => void;
  isSpeaking: boolean;
  isListening: boolean;
  toggleListening: () => void;
  stopSpeaking: () => void;
  speakMessage: (text: string) => void;
  settings: AssistantSettings | null;
}

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface AssistantSettings {
  assistantName: string;
  maxContext: number;
  analyticsCollection: boolean;
  apiKey: string;
  model: string;
  temperature: number;
  voiceEnabled: boolean;
  selectedVoice: string;
  speechSpeed: number;
  systemPrompt: string;
}

const defaultSettings: AssistantSettings = {
  assistantName: "Personal Assistant",
  maxContext: 10,
  analyticsCollection: true,
  apiKey: "",
  model: "gemini-1.5-pro",
  temperature: 0.7,
  voiceEnabled: true,
  selectedVoice: "en-US-Standard-B",
  speechSpeed: 1,
  systemPrompt: "You are a helpful AI assistant that provides accurate, concise, and helpful information."
};

const AssistantContext = createContext<AssistantContextType | undefined>(undefined);

export function AssistantProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(localStorage.getItem('gemini_api_key'));
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [settings, setSettings] = useState<AssistantSettings | null>(null);
  const { toast } = useToast();
  const { addToHistory } = useHistory();
  
  // Speech synthesis
  const speechSynthesis = window.speechSynthesis;
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  // Load global settings from database
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const dbSettings = await loadGlobalSettings();
        if (dbSettings) {
          setSettings(dbSettings);
          // Apply critical settings immediately
          if (dbSettings.apiKey) {
            setApiKey(dbSettings.apiKey);
            localStorage.setItem('gemini_api_key', dbSettings.apiKey);
          }
        } else {
          setSettings(defaultSettings);
        }
      } catch (error) {
        console.error("Failed to load assistant settings:", error);
        setSettings(defaultSettings);
      }
    };
    
    loadSettings();
    
    // Listen for settings updates
    const handleSettingsUpdate = async () => {
      const newSettings = await loadGlobalSettings();
      if (newSettings) {
        setSettings(newSettings);
        if (newSettings.apiKey) {
          setApiKey(newSettings.apiKey);
          localStorage.setItem('gemini_api_key', newSettings.apiKey);
        }
      }
    };
    
    window.addEventListener('settingsUpdate', handleSettingsUpdate);
    return () => {
      window.removeEventListener('settingsUpdate', handleSettingsUpdate);
    };
  }, []);

  // Initialize speech recognition if available
  useEffect(() => {
    try {
      // Check if SpeechRecognition is available
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = false;
        recognitionInstance.interimResults = false;
        
        recognitionInstance.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          addMessage(transcript, 'user');
          sendMessage(transcript);
          setIsListening(false);
        };
        
        recognitionInstance.onerror = (event) => {
          console.error('Speech recognition error', event.error);
          setIsListening(false);
          toast({
            title: 'Voice Input Error',
            description: `Error: ${event.error}`,
            variant: 'destructive',
          });
        };
        
        recognitionInstance.onend = () => {
          setIsListening(false);
        };
        
        setRecognition(recognitionInstance);
      } else {
        console.warn('Speech Recognition API not supported in this browser');
      }
    } catch (error) {
      console.error('Error initializing speech recognition:', error);
    }
  }, []);
  
  // Save API key to local storage when it changes
  useEffect(() => {
    if (apiKey) {
      localStorage.setItem('gemini_api_key', apiKey);
    }
  }, [apiKey]);

  const speakMessage = (text: string) => {
    if (!settings?.voiceEnabled || !speechSynthesis) return;
    
    stopSpeaking(); // Stop any ongoing speech
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Apply voice settings if available
    if (settings) {
      // Find the voice that matches the selected voice name
      const voices = speechSynthesis.getVoices();
      const voice = voices.find(v => v.name === settings.selectedVoice) || 
                    voices.find(v => v.lang.startsWith('en')) || 
                    null;
      
      if (voice) utterance.voice = voice;
      utterance.rate = settings.speechSpeed || 1;
    }
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    speechSynthesis.speak(utterance);
  };

  const addMessage = (content: string, role: 'user' | 'assistant') => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      role,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
    
    // If it's an assistant message and voice is enabled, speak it out
    if (role === 'assistant' && settings?.voiceEnabled && speechSynthesis) {
      speakMessage(content);
    }
  };

  const stopSpeaking = () => {
    if (speechSynthesis) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const toggleListening = () => {
    if (!recognition) {
      toast({
        title: 'Speech Recognition Unavailable',
        description: 'Your browser does not support speech recognition. Try using Chrome or Edge.',
        variant: 'destructive',
      });
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      try {
        recognition.start();
        setIsListening(true);
        toast({
          title: 'Listening...',
          description: 'Speak now. I\'m listening to your voice input.',
          variant: 'default',
        });
      } catch (error) {
        console.error('Failed to start speech recognition', error);
        setIsListening(false);
        toast({
          title: 'Speech Recognition Error',
          description: 'Failed to start speech recognition. Please try again.',
          variant: 'destructive',
        });
      }
    }
  };

  const sendMessage = async (content: string) => {
    if (!apiKey) {
      toast({
        title: 'API Key Missing',
        description: 'Please set your Gemini API key in the settings.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsProcessing(true);
      
      // Track this query in history if analytics collection is enabled
      if (settings?.analyticsCollection !== false) {
        addToHistory(content);
      }
      
      // Get conversation history for context
      const contextSize = settings?.maxContext || 10;
      const recentMessages = messages.slice(-contextSize).map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
      }));
      
      // Add system prompt if available
      const systemPrompt = settings?.systemPrompt || defaultSettings.systemPrompt;
      const allMessages = systemPrompt ? [
        { role: 'user', parts: [{ text: systemPrompt }] },
        { role: 'assistant', parts: [{ text: 'I understand and will follow these instructions.' }] },
        ...recentMessages
      ] : recentMessages;
      
      // Make API request to Gemini API with current settings
      const modelName = settings?.model || "gemini-1.5-pro";
      const temp = settings?.temperature || 0.7;
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            ...allMessages,
            {
              role: 'user',
              parts: [{ text: content }]
            }
          ],
          generationConfig: {
            temperature: temp,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API Error: ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates.length > 0 && 
          data.candidates[0].content && data.candidates[0].content.parts && 
          data.candidates[0].content.parts.length > 0) {
        const assistantResponse = data.candidates[0].content.parts[0].text;
        addMessage(assistantResponse, 'assistant');
      } else {
        throw new Error('Invalid response format from Gemini API');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to get response from Gemini',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const clearConversation = () => {
    setMessages([]);
    stopSpeaking();
  };

  const value = {
    messages,
    addMessage,
    isProcessing,
    sendMessage,
    clearConversation,
    apiKey,
    setApiKey,
    isSpeaking,
    isListening,
    toggleListening,
    stopSpeaking,
    speakMessage,
    settings
  };

  return (
    <AssistantContext.Provider value={value}>
      {children}
    </AssistantContext.Provider>
  );
}

export function useAssistant() {
  const context = useContext(AssistantContext);
  if (context === undefined) {
    throw new Error('useAssistant must be used within an AssistantProvider');
  }
  return context;
}
