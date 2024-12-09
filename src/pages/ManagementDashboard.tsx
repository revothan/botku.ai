import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SideNav } from "@/components/SideNav";
import DomainSection from "@/components/dashboard/DomainSection";
import SettingsSection from "@/components/dashboard/SettingsSection";
import SettingsPreview from "@/components/dashboard/SettingsPreview";
import AuthCheck from "@/components/dashboard/AuthCheck";
import { useToast } from "@/hooks/use-toast";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useSettingsQuery } from "@/hooks/useSettingsQuery";

const ManagementDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  const { data: settings, isLoading: isSettingsLoading } = useSettingsQuery(userId, isAuthChecking);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Logout error:", error);
        throw error;
      }
      navigate("/");
    } catch (error: any) {
      console.error("Error during logout:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Show loading state only when auth is being checked
  if (isAuthChecking) {
    console.log("Auth checking in progress...");
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fcf5eb]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
      </div>
    );
  }

  // If auth check is complete but no userId, return null (AuthCheck component will handle redirect)
  if (!userId) {
    console.log("No user ID found after auth check");
    return null;
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <AuthCheck 
        onAuthChecked={setUserId}
        onAuthCheckingChange={setIsAuthChecking}
      />
      <div className="flex h-screen w-full overflow-hidden bg-gradient-to-b from-[#fcf5eb] to-white">
        <SideNav onSignOut={handleLogout} />
        <main className="flex-1 overflow-auto">
          <div className="p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-6 text-secondary">Share Your Chatbot</h2>
                <DomainSection userId={userId} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-7 space-y-8">
                  <div>
                    <h1 className="text-2xl font-bold mb-6 text-secondary">Chatbot Settings</h1>
                    <SettingsSection
                      userId={userId}
                      settings={settings}
                      isLoading={isSettingsLoading}
                    />
                  </div>
                </div>

                <div className="lg:col-span-5">
                  <div className="lg:sticky lg:top-8">
                    <SettingsPreview settings={settings} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default ManagementDashboard;