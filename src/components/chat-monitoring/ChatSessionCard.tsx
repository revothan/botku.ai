import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import type { ChatSession } from "@/types/chat";

interface ChatSessionCardProps {
  session: ChatSession;
}

export const ChatSessionCard = ({ session }: ChatSessionCardProps) => {
  return (
    <Card key={session.id} className="relative">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-sm font-medium">
            Visitor {session.visitor_id.slice(0, 8)}
          </CardTitle>
          <Badge 
            variant={
              session.status === "active" 
                ? "default" 
                : session.status === "ended" 
                  ? "secondary" 
                  : "outline"
            }
          >
            {session.status}
          </Badge>
        </div>
        <div className="text-xs text-muted-foreground">
          Started {formatDistanceToNow(new Date(session.created_at))} ago
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <div className="space-y-4">
            {session.messages?.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`rounded-lg px-3 py-2 max-w-[80%] ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : message.role === "owner"
                      ? "bg-blue-500 text-white"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <span className="text-xs opacity-70">
                    {formatDistanceToNow(new Date(message.created_at))} ago
                  </span>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};