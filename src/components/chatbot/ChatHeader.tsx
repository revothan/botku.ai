import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

type ChatHeaderProps = {
  botName: string;
  avatarUrl?: string;
};

export const ChatHeader = ({ botName, avatarUrl }: ChatHeaderProps) => {
  return (
    <div className="text-center border-b pb-4 flex items-center justify-center gap-3">
      <Avatar className="h-8 w-8">
        <AvatarImage src={avatarUrl} alt={botName} />
        <AvatarFallback>{botName[0]?.toUpperCase()}</AvatarFallback>
      </Avatar>
      <h3 className="font-bold text-secondary">{botName}</h3>
    </div>
  );
};