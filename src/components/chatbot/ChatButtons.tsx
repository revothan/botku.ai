import { type ButtonConfig } from "@/types/chatbot";

export const ChatButtons = ({ buttons }: { buttons: ButtonConfig[] }) => {
  if (!buttons.length) return null;
  
  return (
    <div className="flex flex-wrap gap-2 mt-4">
      {buttons.map((button) => (
        <a
          key={button.id}
          href={button.url}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm hover:bg-primary/30 transition-colors"
        >
          {button.label}
        </a>
      ))}
    </div>
  );
};