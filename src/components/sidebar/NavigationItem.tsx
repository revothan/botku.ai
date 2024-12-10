import { LucideIcon } from "lucide-react";
import { SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { useSidebar } from "@/components/ui/sidebar";

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
  const { setOpenMobile } = useSidebar();

  const handleClick = () => {
    onClick();
    setOpenMobile(false); // Close mobile menu after navigation
  };

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        onClick={handleClick}
        isActive={isActive}
        className="w-full flex items-center gap-2 p-2 cursor-pointer"
      >
        <Icon className="h-4 w-4 shrink-0" />
        <span>{title}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}