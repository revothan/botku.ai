import { type Message } from "@/types/chatbot";

export const ChatMessage = ({ message }: { message: Message }) => {
  return (
    <div
      className={`${
        message.role === "assistant"
          ? "bg-primary/10 rounded-lg p-3 max-w-[80%]"
          : message.role === "owner"
          ? "bg-blue-100 rounded-lg p-3 max-w-[80%] ml-auto"
          : "bg-primary/5 rounded-lg p-3 max-w-[80%] ml-auto"
      } animate-fade-in`}
    >
      {message.role === "owner" && (
        <div className="text-xs text-blue-600 mb-1">Owner</div>
      )}
      <p className="text-sm">{message.content}</p>
    </div>
  );
};