import { LogOut } from "lucide-react";
import { 
  SidebarFooter as Footer,
  SidebarMenuButton 
} from "@/components/ui/sidebar";
import { 
  Tooltip,
  TooltipContent,
  TooltipTrigger 
} from "@/components/ui/tooltip";

interface SidebarFooterProps {
  state: 'expanded' | 'collapsed';
  onSignOut: () => Promise<void>;
}

export function SidebarFooter({ state, onSignOut }: SidebarFooterProps) {
  return (
    <Footer className="p-4 mt-auto border-t">
      <Tooltip>
        <TooltipTrigger asChild>
          <SidebarMenuButton
            onClick={onSignOut}
            variant="outline"
            className="w-full flex items-center gap-2 p-2"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {state === 'expanded' && <span>Logout</span>}
          </SidebarMenuButton>
        </TooltipTrigger>
        {state === 'collapsed' && (
          <TooltipContent side="right">
            Logout
          </TooltipContent>
        )}
      </Tooltip>
    </Footer>
  );
}