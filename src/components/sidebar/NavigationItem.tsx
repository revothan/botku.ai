import { LucideIcon } from "lucide-react";
import { 
  SidebarMenuItem,
  SidebarMenuButton 
} from "@/components/ui/sidebar";
import { 
  Tooltip,
  TooltipContent,
  TooltipTrigger 
} from "@/components/ui/tooltip";

interface NavigationItemProps {
  title: string;
  icon: LucideIcon;
  isActive: boolean;
  state: 'expanded' | 'collapsed';
  onClick: () => void;
}

export function NavigationItem({ 
  title, 
  icon: Icon, 
  isActive, 
  state, 
  onClick 
}: NavigationItemProps) {
  return (
    <SidebarMenuItem>
      <Tooltip>
        <TooltipTrigger asChild>
          <SidebarMenuButton
            onClick={onClick}
            isActive={isActive}
            className="w-full flex items-center gap-2 p-2"
          >
            <Icon className="h-5 w-5 shrink-0" />
            {state === 'expanded' && <span>{title}</span>}
          </SidebarMenuButton>
        </TooltipTrigger>
        {state === 'collapsed' && (
          <TooltipContent side="right">
            {title}
          </TooltipContent>
        )}
      </Tooltip>
    </SidebarMenuItem>
  );
}