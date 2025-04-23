
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import React from "react";

interface VoiceSettingsProps {
  voiceEnabled: boolean;
  setVoiceEnabled: (v: boolean) => void;
  selectedVoice: string;
  setSelectedVoice: (v: string) => void;
  speechSpeed: number;
  setSpeechSpeed: (v: number) => void;
  isLoading: boolean;
  onSave: () => void;
}

const VoiceSettings: React.FC<VoiceSettingsProps> = ({
  voiceEnabled,
  setVoiceEnabled,
  selectedVoice,
  setSelectedVoice,
  speechSpeed,
  setSpeechSpeed,
  isLoading,
  onSave,
}) => (
  <Card>
    <CardHeader>
      <CardTitle>Voice Settings</CardTitle>
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Label htmlFor="voice-enabled">Voice Output Enabled</Label>
          <p className="text-xs text-muted-foreground">
            Read responses aloud using text-to-speech
          </p>
        </div>
        <Switch 
          id="voice-enabled" 
          checked={voiceEnabled}
          onCheckedChange={setVoiceEnabled}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="voice-select">Voice</Label>
        <Select 
          value={selectedVoice}
          onValueChange={setSelectedVoice}
          disabled={!voiceEnabled}
        >
          <SelectTrigger id="voice-select">
            <SelectValue placeholder="Select voice" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en-US-Standard-B">Male Voice</SelectItem>
            <SelectItem value="en-US-Standard-C">Female Voice</SelectItem>
            <SelectItem value="en-US-Standard-D">Male Voice 2</SelectItem>
            <SelectItem value="en-US-Standard-E">Female Voice 2</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-3">
        <div className="flex justify-between">
          <Label htmlFor="speed-slider">Speech Speed</Label>
        </div>
        <Slider
          id="speed-slider"
          min={0.5}
          max={2}
          step={0.1}
          value={[speechSpeed]}
          onValueChange={v => setSpeechSpeed(v[0])}
          disabled={!voiceEnabled}
        />
      </div>
      <Button onClick={onSave} disabled={isLoading || !voiceEnabled}>
        {isLoading ? "Saving..." : "Save Voice Settings"}
      </Button>
    </CardContent>
  </Card>
);

export default VoiceSettings;
