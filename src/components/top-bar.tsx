import { Bell } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "./user-avatar";
import { Separator } from "@/components/ui/separator";

export function TopBar({ title, actions }: { title?: string; actions?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-1 h-5" />
      {title && <h1 className="text-sm font-semibold">{title}</h1>}
      <div className="ml-auto flex items-center gap-2">
        {actions}
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="h-4 w-4" />
        </Button>
        <UserAvatar name="Alex Morgan" size={28} />
      </div>
    </header>
  );
}
