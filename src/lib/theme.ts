export type ThemeMode = 'light' | 'dark';

export interface PrimaryColorPreset {
  id: string;
  nameAr: string;
  nameEn: string;
  hex: string;
}

export const PRESET_PRIMARY_COLORS: PrimaryColorPreset[] = [
  { id: 'blue', nameAr: 'أزرق ملكي', nameEn: 'Royal Blue', hex: '#2563eb' },
  { id: 'indigo', nameAr: 'نيلي كلاسيكي', nameEn: 'Indigo', hex: '#4f46e5' },
  { id: 'emerald', nameAr: 'زمردي تجاري', nameEn: 'Emerald Green', hex: '#059669' },
  { id: 'teal', nameAr: 'تركوازي قيد', nameEn: 'Teal Qayd', hex: '#0d9488' },
  { id: 'violet', nameAr: 'بنفسجي عصري', nameEn: 'Modern Violet', hex: '#7c3aed' },
  { id: 'rose', nameAr: 'ياقوتي جذاب', nameEn: 'Vibrant Rose', hex: '#e11d48' },
  { id: 'amber', nameAr: 'كهرماني ذهبي', nameEn: 'Warm Amber', hex: '#d97706' },
  { id: 'cyan', nameAr: 'سماوي رقمي', nameEn: 'Digital Cyan', hex: '#0891b2' },
  { id: 'slate', nameAr: 'فحمي أنيق', nameEn: 'Slate Charcoal', hex: '#475569' }
];

export const DEFAULT_PRIMARY_COLOR = '#2563eb';
export const DEFAULT_THEME_MODE: ThemeMode = 'light';

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let cleanHex = hex.replace('#', '').trim();
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(c => c + c).join('');
  }
  const num = parseInt(cleanHex, 16);
  if (isNaN(num)) {
    return { r: 37, g: 99, b: 235 }; // fallback #2563eb
  }
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

export function adjustBrightness(hex: string, percent: number): string {
  const { r, g, b } = hexToRgb(hex);
  const adjust = (channel: number) => {
    const res = Math.round(channel * (1 + percent / 100));
    return Math.min(255, Math.max(0, res)).toString(16).padStart(2, '0');
  };
  return `#${adjust(r)}${adjust(g)}${adjust(b)}`;
}

/**
 * Dynamically injects CSS variables to the document root
 * representing the primary color, hover, subtle background, borders, and contrast text.
 */
export function applyThemePrimaryColor(colorHex: string, isDark: boolean = false) {
  if (typeof document === 'undefined') return;

  const validHex = /^#[0-9A-Fa-f]{6}$/.test(colorHex) ? colorHex : DEFAULT_PRIMARY_COLOR;
  const { r, g, b } = hexToRgb(validHex);
  const hoverHex = adjustBrightness(validHex, isDark ? 12 : -12);
  const lightBg = isDark ? `rgba(${r}, ${g}, ${b}, 0.22)` : `rgba(${r}, ${g}, ${b}, 0.08)`;
  const borderBg = isDark ? `rgba(${r}, ${g}, ${b}, 0.45)` : `rgba(${r}, ${g}, ${b}, 0.25)`;

  const root = document.documentElement;
  root.style.setProperty('--primary-color', validHex);
  root.style.setProperty('--primary-hover', hoverHex);
  root.style.setProperty('--primary-light', lightBg);
  root.style.setProperty('--primary-border', borderBg);
  root.style.setProperty('--primary-rgb', `${r}, ${g}, ${b}`);

  // Calculate contrast text luminance (white vs dark text)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  const textColor = luminance > 0.65 ? '#0f172a' : '#ffffff';
  root.style.setProperty('--primary-text', textColor);
}

/**
 * Toggles the 'dark' CSS class on document.documentElement
 */
export function applyThemeMode(mode: ThemeMode) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (mode === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}
