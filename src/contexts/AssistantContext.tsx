import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { loadGlobalSettings } from "@/utils/globalSettings";
import { useHistory } from "@/contexts/HistoryContext";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";
import { AssistantContextType, Message, AssistantSettings } from "./assistant/types";
import { useAssistantSpeech } from "./assistant/useAssistantSpeech";
import { useAssistantRecognition } from "./assistant/useAssistantRecognition";

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
  systemPrompt: "You are a helpful AI assistant that provides accurate, concise, and helpful information.",
};

const AssistantContext = createContext<AssistantContextType | undefined>(undefined);

export function AssistantProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(localStorage.getItem('gemini_api_key'));
  const [settings, setSettings] = useState<AssistantSettings | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const { toast } = useToast();
  const { addToHistory } = useHistory();
  const { user } = useAuth();

  const { isSpeaking, speakMessage, stopSpeaking } = useAssistantSpeech(settings);

  const [inputToProcess, setInputToProcess] = useState<string | null>(null);
  const recognitionFns = useAssistantRecognition(
    (transcript) => setInputToProcess(transcript),
    (error) => {
      toast({
        title: "Voice Input Error",
        description: `Error: ${error}. Please try again later.`,
        variant: 'destructive',
      });
      setIsProcessingVoice(false);
    },
    () => {
      setIsProcessingVoice(false);
    }
  );
  const isListening = recognitionFns.isListening;
  const toggleListening = () => {
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      toast({
        title: 'Speech Recognition Unavailable',
        description: 'Your browser does not support speech recognition. Try using Chrome or Edge.',
        variant: 'destructive',
      });
      return;
    }
    if (isListening || isProcessingVoice) {
      recognitionFns.stopListening();
      setIsProcessingVoice(false);
    } else {
      setIsProcessingVoice(true);
      recognitionFns.startListening();
      toast({
        title: 'Listening...',
        description: "Speak now. I'm listening to your voice input.",
        variant: 'default',
      });
    }
  };

  useEffect(() => {
    if (inputToProcess) {
      (async () => {
        setIsProcessingVoice(true);
        await addMessage(inputToProcess, "user");
        await sendMessage(inputToProcess);
        setInputToProcess(null);
        setIsProcessingVoice(false);
      })();
    }
  }, [inputToProcess]);

  useEffect(() => {
    const loadConversationHistory = async () => {
      localStorage.removeItem('conversation_history');
      
      if (user) {
        try {
          const { data, error } = await (supabase
            .from('conversation_history') as any)
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: true });
          
          if (error) throw error;
          
          if (data && data.length > 0) {
            const supabaseMessages = data.map((item: any) => ({
              id: item.id,
              content: item.content,
              role: item.role as 'user' | 'assistant',
              timestamp: new Date(item.created_at)
            }));
            
            setMessages(supabaseMessages);
          }
        } catch (error) {
          console.error('Failed to fetch conversation history from Supabase', error);
        }
      }
    };
    
    loadConversationHistory();
  }, [user]);
  
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedApiKey = localStorage.getItem('gemini_api_key');
        if (savedApiKey) {
          setApiKey(savedApiKey);
        }
        
        const dbSettings = await loadGlobalSettings();
        if (dbSettings) {
          setSettings(dbSettings);
          if (dbSettings.apiKey && (!savedApiKey || dbSettings.apiKey !== savedApiKey)) {
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

  useEffect(() => {
    if (apiKey) {
      localStorage.setItem('gemini_api_key', apiKey);
    }
  }, [apiKey]);

  const addMessage = useCallback(
    async (content: string, role: 'user' | 'assistant') => {
      const newMessage: Message = {
        id: Date.now().toString(),
        content,
        role,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, newMessage]);
      if (role === "assistant" && settings?.voiceEnabled) {
        speakMessage(content);
      }
      if (user) {
        try {
          await (supabase.from('conversation_history') as any).insert([{
            user_id: user.id,
            content,
            role,
            created_at: new Date().toISOString()
          }]);
        } catch (error) {
          console.error('Failed to save conversation to Supabase', error);
        }
      }
    },
    [settings, speakMessage, user]
  );

  const sendMessage = useCallback(
    async (content: string) => {
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
        if (messages.length === 0 || messages[messages.length - 1].role !== 'user') {
          await addMessage(content, 'user');
        }
        if (settings?.analyticsCollection !== false) {
          addToHistory(content);
        }
        const contextSize = settings?.maxContext || 10;
        const recentMessages = messages.slice(-contextSize).map(msg => ({
          role: msg.role,
          parts: [{ text: msg.content }]
        }));
        const systemPrompt = settings?.systemPrompt || defaultSettings.systemPrompt;
        const allMessages = systemPrompt ? [
          { role: 'user', parts: [{ text: systemPrompt }] },
          { role: 'assistant', parts: [{ text: 'I understand and will follow these instructions.' }] },
          ...recentMessages
        ] : recentMessages;
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
          const errorMessage = errorData.error?.message || 'Unknown error';
          if (errorMessage.includes('overloaded') && retryCount < 3) {
            setRetryCount(prev => prev + 1);
            toast({
              title: 'Model Overloaded',
              description: `Retrying in 2 seconds... (Attempt ${retryCount + 1}/3)`,
              variant: 'default',
            });
            setTimeout(() => sendMessage(content), 2000);
            return;
          }
          throw new Error(`API Error: ${errorMessage}`);
        }
        setRetryCount(0);
        const data = await response.json();
        if (data.candidates && data.candidates.length > 0 && 
            data.candidates[0].content && data.candidates[0].content.parts && 
            data.candidates[0].content.parts.length > 0) {
          const assistantResponse = data.candidates[0].content.parts[0].text;
          await addMessage(assistantResponse, 'assistant');
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
    },
    [apiKey, messages, settings, addMessage, addToHistory, toast]
  );

  const clearConversation = useCallback(async () => {
    setMessages([]);
    stopSpeaking();
    localStorage.removeItem("conversation_history");
    if (user) {
      try {
        await (supabase.from('conversation_history') as any).delete().eq('user_id', user.id);
      } catch (error) {
        console.error('Failed to clear conversation from Supabase', error);
      }
    }
  }, [user, stopSpeaking]);

  const value: AssistantContextType = {
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
    settings,
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
    throw new Error("useAssistant must be used within an AssistantProvider");
  }
  return context;
}
