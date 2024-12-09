import { LogOut } from "lucide-react";
import { SidebarFooter as Footer, SidebarMenuButton } from "@/components/ui/sidebar";

interface SidebarFooterProps {
  onSignOut: () => Promise<void>;
}

export function SidebarFooter({ onSignOut }: SidebarFooterProps) {
  return (
    <Footer className="p-2 mt-auto border-t">
      <SidebarMenuButton
        onClick={onSignOut}
        variant="outline"
        className="w-full flex items-center gap-2 p-2"
      >
        <LogOut className="h-4 w-4 shrink-0" />
        <span>Logout</span>
      </SidebarMenuButton>
    </Footer>
  );
}