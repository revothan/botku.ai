import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "@/components/chatbot/ChatMessage";
import { ChatButtons } from "@/components/chatbot/ChatButtons";
import type { Message, ButtonConfig } from "@/types/chatbot";

interface ChatMessagesProps {
  messages: Message[];
  buttons: ButtonConfig[];
  isLoading: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  greeting: string;
}

export const ChatMessages = ({ messages, buttons, isLoading, messagesEndRef, greeting }: ChatMessagesProps) => {
  return (
    <ScrollArea className="flex-1 py-4">
      <div className="space-y-4">
        <div className="bg-primary/10 rounded-lg p-3 max-w-[80%]">
          <p className="text-sm">{greeting}</p>
        </div>

        {messages.map((message, index) => (
          <ChatMessage key={index} message={message} />
        ))}

        {isLoading && (
          <div className="bg-primary/10 rounded-lg p-3 max-w-[80%] animate-pulse">
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-primary/30 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-primary/30 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-2 h-2 bg-primary/30 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        )}

        <ChatButtons buttons={buttons} />
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
};