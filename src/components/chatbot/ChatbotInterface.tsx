import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { ChatMessage } from "@/components/chatbot/ChatMessage";
import { ChatInput } from "@/components/chatbot/ChatInput";
import { ChatButtons } from "@/components/chatbot/ChatButtons";
import type { Message, ButtonConfig, ChatbotSettings } from "@/types/chatbot";

type ChatbotInterfaceProps = {
  settings: ChatbotSettings;
  messages: Message[];
  inputMessage: string;
  setInputMessage: (message: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  isLoading?: boolean;
};

export const ChatbotInterface = ({
  settings,
  messages,
  inputMessage,
  setInputMessage,
  handleSubmit,
  messagesEndRef,
  isLoading = false,
}: ChatbotInterfaceProps) => {
  const buttons = (settings.buttons || []) as ButtonConfig[];

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-[#fcf5eb] to-white p-4 flex items-center justify-center">
      <div className="w-full max-w-lg">
        <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="text-center border-b pb-4">
              <h3 className="font-bold text-secondary">{settings.bot_name}</h3>
            </div>
            <ScrollArea className="h-[calc(100dvh-16rem)] py-4">
              <div className="space-y-4">
                <div className="bg-primary/10 rounded-lg p-3 max-w-[80%]">
                  <p className="text-sm">{settings.greeting_message}</p>
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
            <div className="border-t pt-4">
              <ChatInput
                inputMessage={inputMessage}
                setInputMessage={setInputMessage}
                handleSubmit={handleSubmit}
                isLoading={isLoading}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};