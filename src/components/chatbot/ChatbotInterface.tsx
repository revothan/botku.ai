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
};

export const ChatbotInterface = ({
  settings,
  messages,
  inputMessage,
  setInputMessage,
  handleSubmit,
  messagesEndRef,
}: ChatbotInterfaceProps) => {
  const buttons = (settings.buttons || []) as ButtonConfig[];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fcf5eb] to-white p-4">
      <div className="max-w-lg mx-auto">
        <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="text-center border-b pb-4">
              <h3 className="font-bold text-secondary">{settings.bot_name}</h3>
            </div>
            <ScrollArea className="h-[400px] py-4">
              <div className="space-y-4">
                <div className="bg-primary/10 rounded-lg p-3 max-w-[80%]">
                  <p className="text-sm">{settings.greeting_message}</p>
                </div>

                {messages.map((message, index) => (
                  <ChatMessage key={index} message={message} />
                ))}

                <ChatButtons buttons={buttons} />
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            <div className="border-t pt-4">
              <ChatInput
                inputMessage={inputMessage}
                setInputMessage={setInputMessage}
                handleSubmit={handleSubmit}
                isLoading={false}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};