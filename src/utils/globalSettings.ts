
import { supabase } from "@/integrations/supabase/client";

// The settings we save/load globally
export type AssistantSettings = {
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
};

const SETTINGS_KEY = "assistant";

export async function loadGlobalSettings(): Promise<AssistantSettings | null> {
  const { data, error } = await supabase
    .from("global_settings")
    .select("value")
    .eq("key", SETTINGS_KEY)
    .maybeSingle();

  if (error) {
    console.error("Error loading global settings:", error);
    return null;
  }
  return data ? (data.value as AssistantSettings) : null;
}

export async function saveGlobalSettings(settings: AssistantSettings): Promise<boolean> {
  const { error } = await supabase
    .from("global_settings")
    .upsert([
      {
        key: SETTINGS_KEY,
        value: settings,
        updated_at: new Date().toISOString(),
      },
    ]);
  if (error) {
    console.error("Error saving global settings:", error);
    return false;
  }
  return true;
}
