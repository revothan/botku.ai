import { LucideIcon } from "lucide-react";
import { SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";

interface NavigationItemProps {
  title: string;
  icon: LucideIcon;
  isActive: boolean;
  onClick: () => void;
}

export function NavigationItem({ 
  title, 
  icon: Icon, 
  isActive, 
  onClick 
}: NavigationItemProps) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        onClick={onClick}
        isActive={isActive}
        className="w-full flex items-center gap-2 p-2 cursor-pointer"
      >
        <Icon className="h-4 w-4 shrink-0" />
        <span>{title}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}