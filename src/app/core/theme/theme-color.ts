export const SOMARA_DEFAULT_CLASS_COLOR_FALLBACK = '#005F6A';

export function getDefaultClassColorHex(): string {
  return readThemeColorHex('--somara-default-class-color', SOMARA_DEFAULT_CLASS_COLOR_FALLBACK);
}

function readThemeColorHex(variableName: string, fallbackHex: string): string {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return fallbackHex;
  }

  const rawValue = getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
  if (rawValue.length === 0) {
    return fallbackHex;
  }

  return normalizeToHex(rawValue) ?? fallbackHex;
}

function normalizeToHex(value: string): string | null {
  const hexMatch = value.match(/^#([0-9a-fA-F]{6})$/);
  if (hexMatch) {
    return `#${hexMatch[1].toUpperCase()}`;
  }

  const rgbMatch = value.match(/^rgb\(\s*(\d{1,3})\s+(\d{1,3})\s+(\d{1,3})\s*\)$/)
    ?? value.match(/^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/);
  if (!rgbMatch) {
    return null;
  }

  const red = clampColorChannel(Number(rgbMatch[1]));
  const green = clampColorChannel(Number(rgbMatch[2]));
  const blue = clampColorChannel(Number(rgbMatch[3]));
  if (red === null || green === null || blue === null) {
    return null;
  }

  return `#${toHex(red)}${toHex(green)}${toHex(blue)}`;
}

function clampColorChannel(value: number): number | null {
  if (!Number.isInteger(value) || value < 0 || value > 255) {
    return null;
  }

  return value;
}

function toHex(value: number): string {
  return value.toString(16).toUpperCase().padStart(2, '0');
}
