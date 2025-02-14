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

    // تطبيق الخط
    const validFonts = ['cairo', 'tajawal', 'almarai'];
    const fontFamily = validFonts.includes(theme.fontFamily.toLowerCase()) ? theme.fontFamily.toLowerCase() : 'cairo';
    document.body.className = `font-${fontFamily}`;

    // تطبيق المظهر
    if (theme.appearance === 'system') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', theme.appearance);
    }

    // تطبيق الحواف
    document.documentElement.style.setProperty('--radius', `${theme.radius}px`);

  }, [theme]);

  return (
    <div className="min-h-screen bg-background flex">
      {children}
    </div>
  );
}