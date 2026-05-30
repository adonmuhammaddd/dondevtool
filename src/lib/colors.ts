/** Color parsing/conversion between HEX, RGB, and HSL. */

export interface Rgb {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface Hsl {
  h: number;
  s: number;
  l: number;
  a: number;
}

/** Parses hex (#rgb/#rgba/#rrggbb/#rrggbbaa), rgb()/rgba(), or hsl()/hsla(). */
export function parseColor(input: string): Rgb | null {
  const s = input.trim().toLowerCase();
  if (!s) return null;

  const hex = parseHex(s);
  if (hex) return hex;

  const rgb = s.match(
    /^rgba?\(\s*([\d.]+)\s*[, ]\s*([\d.]+)\s*[, ]\s*([\d.]+)\s*(?:[,/]\s*([\d.]+%?)\s*)?\)$/,
  );
  if (rgb) {
    return {
      r: clampByte(+rgb[1]),
      g: clampByte(+rgb[2]),
      b: clampByte(+rgb[3]),
      a: rgb[4] != null ? parseAlpha(rgb[4]) : 1,
    };
  }

  const hsl = s.match(
    /^hsla?\(\s*([\d.]+)\s*[, ]\s*([\d.]+)%\s*[, ]\s*([\d.]+)%\s*(?:[,/]\s*([\d.]+%?)\s*)?\)$/,
  );
  if (hsl) {
    return hslToRgb({
      h: +hsl[1],
      s: +hsl[2],
      l: +hsl[3],
      a: hsl[4] != null ? parseAlpha(hsl[4]) : 1,
    });
  }

  return null;
}

function parseHex(s: string): Rgb | null {
  const m = s.match(/^#?([0-9a-f]{3,8})$/);
  if (!m) return null;
  const h = m[1];
  const expand = (c: string) => parseInt(c + c, 16);
  if (h.length === 3 || h.length === 4) {
    return {
      r: expand(h[0]),
      g: expand(h[1]),
      b: expand(h[2]),
      a: h.length === 4 ? expand(h[3]) / 255 : 1,
    };
  }
  if (h.length === 6 || h.length === 8) {
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
      a: h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1,
    };
  }
  return null;
}

export function rgbToHex({ r, g, b, a }: Rgb): string {
  const h = (n: number) => Math.round(n).toString(16).padStart(2, "0");
  const base = `#${h(r)}${h(g)}${h(b)}`;
  return a < 1 ? base + h(a * 255) : base;
}

export function rgbToHsl({ r, g, b, a }: Rgb): Hsl {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === rn) h = ((gn - bn) / d) % 6;
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  const l = (max + min) / 2;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100), a };
}

export function hslToRgb({ h, s, l, a }: Hsl): Rgb {
  const sn = s / 100;
  const ln = l / 100;
  const c = (1 - Math.abs(2 * ln - 1)) * sn;
  const hp = (((h % 360) + 360) % 360) / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let r = 0;
  let g = 0;
  let b = 0;
  if (hp < 1) [r, g, b] = [c, x, 0];
  else if (hp < 2) [r, g, b] = [x, c, 0];
  else if (hp < 3) [r, g, b] = [0, c, x];
  else if (hp < 4) [r, g, b] = [0, x, c];
  else if (hp < 5) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const m = ln - c / 2;
  return {
    r: clampByte((r + m) * 255),
    g: clampByte((g + m) * 255),
    b: clampByte((b + m) * 255),
    a,
  };
}

export function rgbToString({ r, g, b, a }: Rgb): string {
  return a < 1
    ? `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${round(a)})`
    : `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
}

export function hslToString({ h, s, l, a }: Hsl): string {
  return a < 1
    ? `hsla(${h}, ${s}%, ${l}%, ${round(a)})`
    : `hsl(${h}, ${s}%, ${l}%)`;
}

/** WCAG relative luminance of an sRGB color (0–1). */
export function relativeLuminance({ r, g, b }: Rgb): number {
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** WCAG contrast ratio between two colors (1–21). */
export function contrastRatio(a: Rgb, b: Rgb): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [hi, lo] = la >= lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

const clampByte = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
const round = (n: number) => Math.round(n * 100) / 100;
function parseAlpha(v: string): number {
  const n = v.endsWith("%") ? parseFloat(v) / 100 : parseFloat(v);
  return Math.max(0, Math.min(1, n));
}
