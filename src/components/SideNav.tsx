import { useSession } from "@supabase/auth-helpers-react";
import { Sidebar, useSidebar } from "@/components/ui/sidebar";
import { SidebarHeader } from "./sidebar/SidebarHeader";
import { NavigationMenu } from "./sidebar/NavigationMenu";
import { SidebarFooter } from "./sidebar/SidebarFooter";

interface SideNavProps {
  onSignOut: () => Promise<void>;
}

export function SideNav({ onSignOut }: SideNavProps) {
  const session = useSession();
  const { state, toggleSidebar } = useSidebar();
  console.log('Sidebar state:', state);
  
  const userEmail = session?.user?.email;
  const displayName = userEmail ? userEmail.split('@')[0] : 'User';

  return (
    <Sidebar variant="sidebar" className="border-r">
      <SidebarHeader 
        displayName={displayName}
        state={state}
        toggleSidebar={toggleSidebar}
      />
      <NavigationMenu state={state} />
      <SidebarFooter 
        state={state}
        onSignOut={onSignOut}
      />
    </Sidebar>
  );
}