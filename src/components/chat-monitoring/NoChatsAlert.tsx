import { Alert, AlertDescription } from "@/components/ui/alert";

export const NoChatsAlert = () => {
  return (
    <div className="p-6">
      <Alert>
        <AlertDescription>
          No active chat sessions found. Chat sessions will appear here once visitors start chatting with your chatbot.
        </AlertDescription>
      </Alert>
    </div>
  );
};