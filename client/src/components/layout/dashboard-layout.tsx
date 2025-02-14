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
  const { data: theme } = useQuery<Theme>({
    queryKey: ["/api/theme"],
  });

  useEffect(() => {
    if (!theme) return;

    // تطبيق المظهر (الثيم)
    document.documentElement.setAttribute('data-theme', theme.appearance === 'dark' ? 'dark' : 'light');

    // تطبيق الخط
    const validFonts = ['cairo', 'tajawal', 'almarai'];
    const fontFamily = validFonts.includes(theme.fontFamily?.toLowerCase()) ? theme.fontFamily.toLowerCase() : 'cairo';
    document.body.className = `font-${fontFamily}`;

    // تطبيق اللون الرئيسي
    if (theme.primary) {
      // تحويل اللون HEX إلى HSL
      const root = document.documentElement;
      const testDiv = document.createElement('div');
      testDiv.style.color = theme.primary;
      document.body.appendChild(testDiv);
      const rgbColor = window.getComputedStyle(testDiv).color;
      document.body.removeChild(testDiv);

      // تحويل RGB إلى HSL
      const rgb = rgbColor.match(/\d+/g)?.map(Number) || [0, 0, 0];
      const r = rgb[0] / 255;
      const g = rgb[1] / 255;
      const b = rgb[2] / 255;

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h = 0, s = 0, l = (max + min) / 2;

      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
        }

        h /= 6;
      }

      // تحويل إلى الصيغة المطلوبة
      const hsl = `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
      root.style.setProperty('--primary-hsl', hsl);
    }

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