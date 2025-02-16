import { DashboardNav } from "./dashboard-nav";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { logoutMutation, user } = useAuth();

  return (
    <div className="flex h-screen bg-background">
      <DashboardNav />
      <main className="flex-1 overflow-y-auto p-8 rtl">
        <div className="flex justify-between items-center mb-6">
          <div>
            {user && (
              <p className="text-sm text-muted-foreground">
                مرحباً {user.name}
              </p>
            )}
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
          >
            <LogOut className="h-4 w-4 ml-2" />
            تسجيل الخروج
          </Button>
        </div>
        {children}
      </main>
    </div>
  );
}