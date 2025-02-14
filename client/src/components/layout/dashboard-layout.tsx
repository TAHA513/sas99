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

// تحويل اللون الرئيسي إلى متغيرات HSL
function hexToHSL(hex: string) {
  // Remove the # if present
  hex = hex.replace('#', '');

  // Convert hex to RGB
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  // Find max and min values
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);

  let h = 0;
  let s = 0;
  let l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }

    h /= 6;
  }

  // Convert to HSL string format
  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);

  return `${h} ${s}% ${l}%`;
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  // جلب الثيم الحالي
  const { data: theme } = useQuery<Theme>({
    queryKey: ["/api/theme"],
  });

  // تطبيق تغييرات الثيم
  useEffect(() => {
    if (theme) {
      // تطبيق الخط مباشرة على body
      document.body.className = `font-${theme.fontFamily}`;

      // تطبيق حجم الخط
      document.documentElement.style.fontSize = fontSizeMap[theme.fontSize as keyof typeof fontSizeMap] || fontSizeMap.medium;

      // تطبيق حجم العناوين
      const headingSize = headingSizeMap[theme.headingSize as keyof typeof headingSizeMap] || headingSizeMap.h2;
      document.documentElement.style.setProperty('--heading-size', headingSize);

      // تطبيق نصف القطر للحواف
      document.documentElement.style.setProperty('--radius', `${theme.radius}rem`);

      // تطبيق اللون الرئيسي
      const hslColor = hexToHSL(theme.primary);
      document.documentElement.style.setProperty('--primary', hslColor);

      // تطبيق نوع الثيم
      document.documentElement.setAttribute('data-theme-variant', theme.variant);

      // تطبيق المظهر (فاتح/داكن)
      if (theme.appearance !== 'system') {
        document.documentElement.setAttribute('data-theme', theme.appearance);
      }
    }
  }, [theme]);

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardNav />
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}