import { Bot } from "lucide-react";

type ChatHeaderProps = {
  botName: string;
};

export const ChatHeader = ({ botName }: ChatHeaderProps) => {
  return (
    <div className="text-center border-b pb-4 flex items-center justify-center gap-3">
      <Bot className="h-5 w-5 text-primary" />
      <h3 className="font-bold text-secondary">{botName}</h3>
    </div>
  );
};