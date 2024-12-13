type ChatHeaderProps = {
  botName: string;
};

export const ChatHeader = ({ botName }: ChatHeaderProps) => {
  return (
    <div className="text-center border-b pb-4">
      <h3 className="font-bold text-secondary">{botName}</h3>
    </div>
  );
};