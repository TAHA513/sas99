import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

interface Theme {
  primary: string;
  variant: 'professional' | 'tint' | 'vibrant';
  appearance: 'light' | 'dark' | 'system';
  radius: number;
  fontSize: string;
  headingSize: string;
  fontFamily: string;
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
    document.body.className = `font-${theme.fontFamily}`;

  }, [theme]);

  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}