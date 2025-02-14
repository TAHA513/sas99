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

const fontSizeMap = {
  small: "0.875rem",
  medium: "1rem",
  large: "1.125rem"
};

const headingSizeMap = {
  h1: "2.25rem",
  h2: "1.875rem",
  h3: "1.5rem"
};

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: theme } = useQuery<Theme>({
    queryKey: ["/api/theme"],
  });

  useEffect(() => {
    if (!theme) return;

    // تطبيق الخط
    document.body.classList.remove('font-cairo', 'font-tajawal', 'font-almarai');
    document.body.classList.add(`font-${theme.fontFamily}`);

    // تطبيق المظهر
    if (theme.appearance === 'system') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', theme.appearance);
    }

    // تطبيق نوع الثيم
    document.documentElement.setAttribute('data-theme-variant', theme.variant);

    // تطبيق الحجم والحواف
    const root = document.documentElement.style;
    root.setProperty('--radius', `${theme.radius}px`);

    // تطبيق حجم الخط
    const fontSize = fontSizeMap[theme.fontSize as keyof typeof fontSizeMap] || fontSizeMap.medium;
    root.setProperty('--base-font-size', fontSize);

    // تطبيق حجم العناوين
    const headingSize = headingSizeMap[theme.headingSize as keyof typeof headingSizeMap] || headingSizeMap.h2;
    root.setProperty('--heading-size', headingSize);

    // تطبيق اللون الرئيسي
    if (theme.primary) {
      document.documentElement.style.setProperty('--primary', theme.primary);
    }

  }, [theme]);

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardNav />
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}