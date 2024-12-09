import { SidebarHeader as Header } from "@/components/ui/sidebar";

interface SidebarHeaderProps {
  displayName: string;
}

export function SidebarHeader({ displayName }: SidebarHeaderProps) {
  return (
    <Header className="flex items-center p-4 border-b">
      <h2 className="text-sm font-semibold text-secondary truncate">
        Hello, {displayName}
      </h2>
    </Header>
  );
}