import { DashboardNav } from "./dashboard-nav";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-background">
      <DashboardNav />
      <main className="flex-1 overflow-y-auto p-8 rtl">
        {children}
      </main>
    </div>
  );
}