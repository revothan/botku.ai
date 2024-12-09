import { useSession } from "@supabase/auth-helpers-react";
import { LogOut, LayoutDashboard, Package, Menu } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

interface SideNavProps {
  onSignOut: () => Promise<void>;
}

export function SideNav({ onSignOut }: SideNavProps) {
  const session = useSession();
  const navigate = useNavigate();
  const location = useLocation();
  const { state, toggleSidebar } = useSidebar();
  
  const userEmail = session?.user?.email;
  const displayName = userEmail ? userEmail.split('@')[0] : 'User';

  const menuItems = [
    {
      title: "Main Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
    },
    {
      title: "Manajemen Produk",
      icon: Package,
      path: "/dashboard/products",
    },
  ];

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold text-secondary">
          Hello, {displayName}
        </h2>
        <Button 
          variant="ghost" 
          size="sm"
          className="hover:bg-muted"
          onClick={toggleSidebar}
          aria-label={state === 'expanded' ? 'Close Sidebar' : 'Open Sidebar'}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SidebarHeader>
      
      <SidebarContent className="p-2">
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                onClick={() => navigate(item.path)}
                isActive={location.pathname === item.path}
                className="w-full"
                tooltip={item.title}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-4 mt-auto border-t">
        <SidebarMenuButton
          onClick={onSignOut}
          variant="outline"
          className="w-full"
          tooltip="Logout"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}