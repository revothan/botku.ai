import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface ChatLimitAlertProps {
  currentCount: number;
  maxCount: number;
}

export const ChatLimitAlert = ({ currentCount, maxCount }: ChatLimitAlertProps) => {
  return (
    <Alert variant="default" className="w-auto bg-yellow-50 border-yellow-200">
      <AlertCircle className="h-4 w-4 text-yellow-600" />
      <AlertDescription className="ml-2 text-yellow-600">
        Showing {currentCount} of maximum {maxCount} recent chats
      </AlertDescription>
    </Alert>
  );
};