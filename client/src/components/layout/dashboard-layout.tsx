import { DashboardNav } from "./dashboard-nav";
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
  // Fetch current theme
  const { data: theme } = useQuery<Theme>({
    queryKey: ["/api/theme"],
  });

  // Apply theme changes
  useEffect(() => {
    if (theme) {
      // Apply font family
      document.documentElement.style.setProperty('--font-family', theme.fontFamily);

      // Apply font sizes
      document.documentElement.style.setProperty('--font-size', theme.fontSize);
      document.documentElement.style.setProperty('--heading-size', theme.headingSize);

      // Apply border radius
      document.documentElement.style.setProperty('--radius', `${theme.radius}rem`);

      // Apply primary color
      document.documentElement.style.setProperty('--primary', theme.primary);

      // Apply variant
      document.documentElement.setAttribute('data-theme-variant', theme.variant);
    }
  }, [theme]);

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardNav />
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}