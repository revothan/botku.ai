import { Button } from "@/components/ui/button";
import { Bot, User } from "lucide-react";
import { toast } from "sonner";

interface ChatControlsProps {
  sessionId: string;
  isAiEnabled: boolean;
  onToggleAi: () => void;
}

export const ChatControls = ({ isAiEnabled, onToggleAi }: ChatControlsProps) => {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Button
        variant={isAiEnabled ? "outline" : "default"}
        size="sm"
        onClick={() => {
          onToggleAi();
          toast.success(
            isAiEnabled ? "AI assistant disabled. You can now chat directly." : "AI assistant enabled"
          );
        }}
      >
        {isAiEnabled ? (
          <>
            <User className="h-4 w-4 mr-2" />
            Take Over Chat
          </>
        ) : (
          <>
            <Bot className="h-4 w-4 mr-2" />
            Enable AI Assistant
          </>
        )}
      </Button>
    </div>
  );
};