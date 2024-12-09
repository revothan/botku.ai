import { PanelLeft, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarHeader as Header } from "@/components/ui/sidebar";

interface SidebarHeaderProps {
  displayName: string;
  state: 'expanded' | 'collapsed';
  toggleSidebar: () => void;
}

export function SidebarHeader({ displayName, state, toggleSidebar }: SidebarHeaderProps) {
  return (
    <Header className="flex items-center justify-between p-4 border-b">
      {state === 'expanded' && (
        <h2 className="text-lg font-semibold text-secondary">
          Hello, {displayName}
        </h2>
      )}
      <Button 
        variant="ghost" 
        size="sm"
        className={`hover:bg-muted ${state === 'expanded' ? 'ml-auto' : 'mx-auto'}`}
        onClick={toggleSidebar}
        aria-label={state === 'expanded' ? 'Collapse Sidebar' : 'Expand Sidebar'}
      >
        {state === 'expanded' ? <PanelLeft className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>
    </Header>
  );
}