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

// دالة مساعدة لتحويل لون HEX إلى HSL
function hexToHSL(hex: string): string {
  // تحويل HEX إلى RGB
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return "262.1 83.3% 57.8%"; // القيمة الافتراضية إذا كان التحويل غير ناجح

  const r = parseInt(result[1], 16) / 255;
  const g = parseInt(result[2], 16) / 255;
  const b = parseInt(result[3], 16) / 255;

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

  // تحويل إلى الصيغة المطلوبة للـ CSS
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
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
      const hslColor = hexToHSL(theme.primary);
      document.documentElement.style.setProperty('--primary-hsl', hslColor);
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