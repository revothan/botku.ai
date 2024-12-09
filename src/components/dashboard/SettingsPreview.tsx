import PhonePreview from "@/components/dashboard/PhonePreview";
import type { ChatbotSettings } from "@/types/chatbot";

type SettingsPreviewProps = {
  settings: ChatbotSettings | undefined;
};

const SettingsPreview = ({ settings }: SettingsPreviewProps) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-secondary">Preview</h2>
      <PhonePreview
        botName={settings?.bot_name || ""}
        greetingMessage={settings?.greeting_message || ""}
        buttons={settings?.buttons || []}
      />
    </div>
  );
};

export default SettingsPreview;