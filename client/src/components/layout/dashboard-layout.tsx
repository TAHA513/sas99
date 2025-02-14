import { DashboardNav } from "./dashboard-nav";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

interface Theme {
  appearance: 'light' | 'dark' | 'system';
  fontFamily: string;
  fontSize: string;
  direction: string;
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: theme } = useQuery<Theme>({
    queryKey: ["/api/theme"],
  });

  useEffect(() => {
    if (!theme) return;

    // تطبيق المظهر (الثيم)
    document.documentElement.setAttribute('data-theme', theme.appearance === 'dark' ? 'dark' : 'light');

    // تطبيق الخط
    const validFonts = ['cairo', 'tajawal', 'almarai', 'ibm-plex-sans-arabic'];
    const fontFamily = validFonts.includes(theme.fontFamily?.toLowerCase()) ? theme.fontFamily.toLowerCase() : 'cairo';
    document.body.className = `font-${fontFamily} text-${theme.fontSize} ${theme.direction}`;

  }, [theme]);

  return (
    <div className="flex h-screen bg-background">
      <DashboardNav />
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
}