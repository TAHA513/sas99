// Convert hex color to HSL format
export const hexToHSL = (hex: string): string => {
  // Remove the hash if it exists
  hex = hex.replace(/^#/, '');

  // Parse the values
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

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

    h = h * 60;
  }

  return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
};

// Update theme CSS variables
export const updateThemeVariables = (primary: string) => {
  const root = document.documentElement;
  const hslColor = hexToHSL(primary);
  root.style.setProperty('--primary', hslColor);
  root.style.setProperty('--primary-foreground', '210 40% 98%');
};
