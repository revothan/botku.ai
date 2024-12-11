import { type Message } from "@/types/chatbot";

export const ChatMessage = ({ message }: { message: Message }) => {
  return (
    <div
      className={`${
        message.role === "assistant"
          ? "bg-primary/10 rounded-lg p-3 max-w-[80%] animate-fade-in"
          : "bg-primary/5 rounded-lg p-3 max-w-[80%] ml-auto animate-fade-in"
      }`}
    >
      <p className="text-sm">{message.content}</p>
    </div>
  );
};