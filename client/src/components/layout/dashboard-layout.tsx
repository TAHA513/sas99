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

function hexToHSL(hex: string): string {
  // تنظيف اللون من علامة #
  hex = hex.replace(/^#/, '');

  // تحويل اللون لـ RGB
  let r = parseInt(hex.slice(0, 2), 16) / 255;
  let g = parseInt(hex.slice(2, 4), 16) / 255;
  let b = parseInt(hex.slice(4, 6), 16) / 255;

  // حساب القيم العليا والدنيا
  let max = Math.max(r, g, b);
  let min = Math.min(r, g, b);

  let h = 0;
  let s = 0;
  let l = (max + min) / 2;

  if (max !== min) {
    let d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0));
        break;
      case g:
        h = ((b - r) / d + 2);
        break;
      case b:
        h = ((r - g) / d + 4);
        break;
    }

    h = h / 6;
  }

  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);

  return `${h} ${s}% ${l}%`;
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: theme } = useQuery<Theme>({
    queryKey: ["/api/theme"],
  });

  useEffect(() => {
    if (theme) {
      // تطبيق الخط
      document.body.className = `font-${theme.fontFamily}`;

      // تطبيق حجم الخط
      const fontSize = fontSizeMap[theme.fontSize as keyof typeof fontSizeMap] || fontSizeMap.medium;
      document.documentElement.style.setProperty('--font-size', fontSize);

      // تطبيق حجم العناوين
      const headingSize = headingSizeMap[theme.headingSize as keyof typeof headingSizeMap] || headingSizeMap.h2;
      document.documentElement.style.setProperty('--heading-size', headingSize);

      // تطبيق حجم الحواف
      document.documentElement.style.setProperty('--radius', `${theme.radius}px`);

      // تطبيق اللون الرئيسي بتنسيق HSL
      const hslColor = hexToHSL(theme.primary);
      document.documentElement.style.setProperty('--primary', hslColor);

      // تطبيق نوع الثيم
      document.documentElement.setAttribute('data-theme-variant', theme.variant);

      // تطبيق المظهر (فاتح/داكن)
      if (theme.appearance === 'system') {
        document.documentElement.removeAttribute('data-theme');
      } else {
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