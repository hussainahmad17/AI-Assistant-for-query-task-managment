
export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export interface AssistantSettings {
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

export interface AssistantContextType {
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
