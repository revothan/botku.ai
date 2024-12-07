import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ChatInputProps {
  inputMessage: string;
  setInputMessage: (message: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

export const ChatInput = ({ inputMessage, setInputMessage, handleSubmit, isLoading }: ChatInputProps) => {
  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        value={inputMessage}
        onChange={(e) => setInputMessage(e.target.value)}
        placeholder="Type your message..."
        className="flex-1"
        disabled={isLoading}
      />
      <Button 
        type="submit" 
        size="icon"
        disabled={isLoading || !inputMessage.trim()}
      >
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
};