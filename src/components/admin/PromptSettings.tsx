
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import React from "react";

interface PromptSettingsProps {
  systemPrompt: string;
  setSystemPrompt: (v: string) => void;
  isLoading: boolean;
  onSave: () => void;
}

const PromptSettings: React.FC<PromptSettingsProps> = ({
  systemPrompt,
  setSystemPrompt,
  isLoading,
  onSave,
}) => (
  <Card>
    <CardHeader>
      <CardTitle>System Prompt</CardTitle>
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="system-prompt">System Instructions</Label>
        <Textarea
          id="system-prompt"
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          rows={6}
          placeholder="Instructions for how the AI should behave"
        />
        <p className="text-xs text-muted-foreground">
          These instructions guide how the assistant behaves and responds
        </p>
      </div>
      <Button onClick={onSave} disabled={isLoading}>
        {isLoading ? "Saving..." : "Save Prompt"}
      </Button>
    </CardContent>
  </Card>
);

export default PromptSettings;
