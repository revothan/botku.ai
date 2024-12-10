import { useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Package } from "lucide-react";
import { SidebarContent, SidebarMenu } from "@/components/ui/sidebar";
import { NavigationItem } from "./NavigationItem";

interface NavigationMenuProps {
  onNavigate?: () => void;
}

export function NavigationMenu({ onNavigate }: NavigationMenuProps) {
  const navigate = useNavigate();
  const location = useLocation();
  console.log('Current location:', location.pathname);

  const menuItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
    },
    {
      title: "Manajemen Produk",
      icon: Package,
      path: "/dashboard/products",
    }
  ];

  const handleNavigation = (path: string) => {
    console.log('Navigating to:', path);
    navigate(path);
    onNavigate?.();
  };

  return (
    <SidebarContent className="p-2">
      <SidebarMenu>
        {menuItems.map((item) => (
          <NavigationItem
            key={item.title}
            title={item.title}
            icon={item.icon}
            isActive={location.pathname.startsWith(item.path)}
            onClick={() => handleNavigation(item.path)}
          />
        ))}
      </SidebarMenu>
    </SidebarContent>
  );
}