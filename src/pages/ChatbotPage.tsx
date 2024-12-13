import { useParams } from "react-router-dom";
import { LoadingState, ErrorState, NotFoundState } from "@/components/chatbot/ChatbotStates";
import { ChatContainer } from "@/components/chatbot/ChatContainer";
import { useChatbotSettings } from "@/hooks/useChatbotSettings";
import type { AssistantResponse } from "@/types/chatbot";

const ChatbotPage = () => {
  const { customDomain } = useParams<{ customDomain: string }>();
  const { data: settings, isLoading, error } = useChatbotSettings(customDomain);

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error.message || "An error occurred while loading the chatbot"} />;
  }

  if (!settings) {
    return <NotFoundState />;
  }

  return <ChatContainer settings={settings} />;
};

export default ChatbotPage;