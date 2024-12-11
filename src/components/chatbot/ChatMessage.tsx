import { type Message } from "@/types/chatbot";
import { Badge } from "@/components/ui/badge";

export const ChatMessage = ({ message }: { message: Message }) => {
  const isUser = message.role === "user";
  const isOwner = message.role === "owner";
  const isAssistant = message.role === "assistant";

  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`${
          isUser
            ? "bg-primary text-primary-foreground"
            : isOwner
            ? "bg-secondary text-secondary-foreground"
            : "bg-primary/10"
        } rounded-lg p-3 max-w-[80%] animate-fade-in`}
      >
        <p className="text-sm">{message.content}</p>
        {isOwner && (
          <div className="mt-1">
            <Badge variant="outline" className="text-[10px]">Owner</Badge>
          </div>
        )}
      </div>
    </div>
  );
};