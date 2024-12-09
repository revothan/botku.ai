import { useState } from "react";
import DomainSection from "@/components/dashboard/DomainSection";
import SettingsSection from "@/components/dashboard/SettingsSection";
import PhonePreview from "@/components/dashboard/PhonePreview";
import type { ChatbotSettings } from "@/types/chatbot";

type DashboardContentProps = {
  userId: string;
  settings: ChatbotSettings | undefined;
  isLoading: boolean;
};

const DashboardContent = ({ userId, settings, isLoading }: DashboardContentProps) => {
  return (
    <div className="h-[100dvh] overflow-y-auto p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Domain Section */}
        <div>
          <h2 className="text-2xl font-bold mb-6 text-secondary">Share Your Chatbot</h2>
          <DomainSection userId={userId} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Settings Column */}
          <div className="lg:col-span-7 space-y-8">
            <div>
              <h1 className="text-2xl font-bold mb-6 text-secondary">Chatbot Settings</h1>
              <SettingsSection
                userId={userId}
                settings={settings}
                isLoading={isLoading}
              />
            </div>
          </div>

          {/* Preview Column */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-8">
              <h2 className="text-2xl font-bold mb-6 text-secondary">Preview</h2>
              <PhonePreview
                botName={settings?.bot_name || ""}
                greetingMessage={settings?.greeting_message || ""}
                buttons={settings?.buttons || []}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;