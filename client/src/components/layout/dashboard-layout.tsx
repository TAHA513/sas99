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

const fontFamilyMap = {
  cairo: "'Cairo', sans-serif",
  tajawal: "'Tajawal', sans-serif",
  almarai: "'Almarai', sans-serif"
};

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
  // Fetch current theme
  const { data: theme } = useQuery<Theme>({
    queryKey: ["/api/theme"],
  });

  // Apply theme changes
  useEffect(() => {
    if (theme) {
      // Apply font family
      const fontFamily = fontFamilyMap[theme.fontFamily as keyof typeof fontFamilyMap] || fontFamilyMap.cairo;
      document.documentElement.style.setProperty('--font-sans', fontFamily);

      // Apply font sizes
      const fontSize = fontSizeMap[theme.fontSize as keyof typeof fontSizeMap] || fontSizeMap.medium;
      document.documentElement.style.setProperty('--font-size-base', fontSize);

      const headingSize = headingSizeMap[theme.headingSize as keyof typeof headingSizeMap] || headingSizeMap.h2;
      document.documentElement.style.setProperty('--font-size-heading', headingSize);

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