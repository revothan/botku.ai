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
    <div className="h-[100dvh] overflow-hidden p-4 md:p-8">
      <div className="h-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content Column */}
        <div className="lg:col-span-7 flex flex-col h-full">
          {/* Fixed Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-secondary">Share Your Chatbot</h2>
          </div>
          
          {/* Scrollable Content */}
          <div className="overflow-y-auto pr-4 flex-1">
            <div className="space-y-8">
              {/* Domain Section */}
              <div>
                <DomainSection userId={userId} />
              </div>

              {/* Settings Section */}
              <div>
                <h2 className="text-2xl font-bold mb-6 text-secondary">Chatbot Settings</h2>
                <SettingsSection
                  userId={userId}
                  settings={settings}
                  isLoading={isLoading}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Preview Column - Fixed */}
        <div className="lg:col-span-5 h-full">
          <div className="sticky top-8">
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
  );
};

export default DashboardContent;