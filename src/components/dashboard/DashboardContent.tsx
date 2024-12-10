import { useState } from "react";
import { Eye, EyeOff, X } from "lucide-react";
import DomainSection from "@/components/dashboard/DomainSection";
import SettingsSection from "@/components/dashboard/SettingsSection";
import PhonePreview from "@/components/dashboard/PhonePreview";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import type { ChatbotSettings } from "@/types/chatbot";

type DashboardContentProps = {
  userId: string;
  settings: ChatbotSettings | undefined;
  isLoading: boolean;
};

const DashboardContent = ({ userId, settings, isLoading }: DashboardContentProps) => {
  const [showPreview, setShowPreview] = useState(false);
  const isMobile = useIsMobile();

  return (
    <div className="h-[100dvh] overflow-hidden p-4 md:p-8">
      <div className="h-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content Column */}
        <div className="lg:col-span-7 h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 pr-4">
          <div className="space-y-8 pb-20 lg:pb-8">
            {/* Domain Section */}
            <div>
              <h2 className="text-2xl font-bold mb-6 text-secondary">Share Your Chatbot</h2>
              <DomainSection userId={userId} />
            </div>

            {/* Settings Section */}
            <div className={isMobile && showPreview ? 'hidden' : ''}>
              <h1 className="text-2xl font-bold mb-6 text-secondary">Chatbot Settings</h1>
              <SettingsSection
                userId={userId}
                settings={settings}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>

        {/* Preview Column - Fixed */}
        <div 
          className={`lg:col-span-5 h-full ${isMobile && !showPreview ? 'hidden' : ''} 
            ${isMobile ? 'fixed inset-0 bg-white z-50 p-4' : 'relative'}`}
        >
          <div className={`${isMobile ? '' : 'sticky top-8'} h-full overflow-auto scrollbar-thin scrollbar-thumb-gray-200`}>
            {/* Close Preview Button (Mobile Only) */}
            {isMobile && showPreview && (
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-secondary">Preview</h2>
                <Button
                  onClick={() => setShowPreview(false)}
                  variant="outline"
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  Close Preview
                </Button>
              </div>
            )}
            {!isMobile && <h2 className="text-2xl font-bold mb-6 text-secondary">Preview</h2>}
            <PhonePreview
              botName={settings?.bot_name || ""}
              greetingMessage={settings?.greeting_message || ""}
              buttons={settings?.buttons || []}
              userId={userId}
            />
          </div>
        </div>
      </div>

      {/* Preview Toggle Button (Mobile Only) - Fixed Position */}
      {isMobile && !showPreview && (
        <div className="fixed left-1/2 bottom-8 -translate-x-1/2 z-50">
          <Button
            onClick={() => setShowPreview(true)}
            variant="secondary"
            className="gap-2 shadow-lg animate-fade-in bg-primary text-white px-6 py-3 rounded-full"
          >
            <Eye className="h-5 w-5" />
            Preview
          </Button>
        </div>
      )}
    </div>
  );
};

export default DashboardContent;