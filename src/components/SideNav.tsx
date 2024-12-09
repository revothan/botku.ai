import { useSession } from "@supabase/auth-helpers-react";
import { Sidebar } from "@/components/ui/sidebar";
import { SidebarHeader } from "./sidebar/SidebarHeader";
import { NavigationMenu } from "./sidebar/NavigationMenu";
import { SidebarFooter } from "./sidebar/SidebarFooter";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Button } from "./ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface SideNavProps {
  onSignOut: () => Promise<void>;
}

export function SideNav({ onSignOut }: SideNavProps) {
  const session = useSession();
  const isMobile = useIsMobile();
  
  const userEmail = session?.user?.email;
  const displayName = userEmail ? userEmail.split('@')[0] : 'User';

  const sidebarContent = (
    <>
      <SidebarHeader displayName={displayName} />
      <NavigationMenu />
      <SidebarFooter onSignOut={onSignOut} />
    </>
  );

  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon"
            className="fixed top-4 right-4 z-50"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent 
          side="top" 
          className="w-full h-[100dvh] flex flex-col bg-background p-0"
        >
          {sidebarContent}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sidebar className="border-r w-52 bg-background">
      {sidebarContent}
    </Sidebar>
  );
}