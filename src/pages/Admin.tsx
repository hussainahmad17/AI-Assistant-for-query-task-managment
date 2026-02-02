
import React, { useEffect, useState } from "react";
import MainLayout from "@/components/layouts/MainLayout";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAssistant } from "@/contexts/AssistantContext";
import { loadGlobalSettings, saveGlobalSettings, AssistantSettings } from "@/utils/globalSettings";
import GeneralSettings from "@/components/admin/GeneralSettings";
import ApiSettings from "@/components/admin/ApiSettings";
import VoiceSettings from "@/components/admin/VoiceSettings";
import PromptSettings from "@/components/admin/PromptSettings";

// Move state logic to the Admin page (acts as a container)
const Admin = () => {
  const { setApiKey } = useAssistant();
  const { toast } = useToast();
  
  const [assistantName, setAssistantName] = useState("Personal Assistant");
  const [maxContext, setMaxContext] = useState(10);
  const [analyticsCollection, setAnalyticsCollection] = useState(true);
  const [newApiKey, setNewApiKey] = useState("");
  const [model, setModel] = useState("gemini-1.5-pro");
  const [temperature, setTemperature] = useState(0.7);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [selectedVoice, setSelectedVoice] = useState("en-US-Standard-B");
  const [speechSpeed, setSpeechSpeed] = useState(1);
  const [systemPrompt, setSystemPrompt] = useState(
    "You are a helpful AI assistant that provides accurate, concise, and helpful information."
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    document.title = "Admin Panel - Personal Assistant";
    setIsLoading(true);
    loadGlobalSettings().then((settings) => {
      if (settings) {
        setAssistantName(settings.assistantName ?? "Personal Assistant");
        setMaxContext(settings.maxContext ?? 10);
        setAnalyticsCollection(settings.analyticsCollection ?? true);
        setNewApiKey(settings.apiKey ?? "");
        setModel(settings.model ?? "gemini-1.5-pro");
        setTemperature(settings.temperature ?? 0.7);
        setVoiceEnabled(settings.voiceEnabled ?? true);
        setSelectedVoice(settings.selectedVoice ?? "en-US-Standard-B");
        setSpeechSpeed(settings.speechSpeed ?? 1);
        setSystemPrompt(settings.systemPrompt ?? "You are a helpful AI assistant that provides accurate, concise, and helpful information.");
        setApiKey(settings.apiKey ?? "");
      }
      setIsLoading(false);
    });
    // eslint-disable-next-line
  }, []);

  const handleSaveAllSettings = async () => {
    setIsLoading(true);
    const settings: AssistantSettings = {
      assistantName,
      maxContext,
      analyticsCollection,
      apiKey: newApiKey,
      model,
      temperature,
      voiceEnabled,
      selectedVoice,
      speechSpeed,
      systemPrompt,
    };
    const result = await saveGlobalSettings(settings);
    setIsLoading(false);
    if (result) {
      setApiKey(newApiKey.trim());
      window.dispatchEvent(new CustomEvent('settingsUpdate'));
      toast({
        title: "Settings Saved",
        description: "Global assistant settings saved and applied for all users.",
      });
    } else {
      toast({
        title: "Error",
        description: "Error saving global settings.",
        variant: "destructive",
      });
    }
  };

  return (
    <MainLayout>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        id="main-content"
      >
        <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>
        <Tabs defaultValue="general">
          <TabsList className="mb-6">
            <TabsTrigger value="general">General Settings</TabsTrigger>
            <TabsTrigger value="api">API Configuration</TabsTrigger>
            <TabsTrigger value="voice">Voice Settings</TabsTrigger>
            <TabsTrigger value="prompt">System Prompt</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <GeneralSettings
              assistantName={assistantName}
              setAssistantName={setAssistantName}
              maxContext={maxContext}
              setMaxContext={setMaxContext}
              analyticsCollection={analyticsCollection}
              setAnalyticsCollection={setAnalyticsCollection}
              isLoading={isLoading}
              onSave={handleSaveAllSettings}
            />
          </TabsContent>
          <TabsContent value="api">
            <ApiSettings
              newApiKey={newApiKey}
              setNewApiKey={setNewApiKey}
              model={model}
              setModel={setModel}
              temperature={temperature}
              setTemperature={setTemperature}
              isLoading={isLoading}
              onSave={handleSaveAllSettings}
            />
          </TabsContent>
          <TabsContent value="voice">
            <VoiceSettings
              voiceEnabled={voiceEnabled}
              setVoiceEnabled={setVoiceEnabled}
              selectedVoice={selectedVoice}
              setSelectedVoice={setSelectedVoice}
              speechSpeed={speechSpeed}
              setSpeechSpeed={setSpeechSpeed}
              isLoading={isLoading}
              onSave={handleSaveAllSettings}
            />
          </TabsContent>
          <TabsContent value="prompt">
            <PromptSettings
              systemPrompt={systemPrompt}
              setSystemPrompt={setSystemPrompt}
              isLoading={isLoading}
              onSave={handleSaveAllSettings}
            />
          </TabsContent>
        </Tabs>
      </motion.div>
    </MainLayout>
  );
};

export default Admin;

