/** Structural diff between two parsed JSON values (key/index-aware). */

export type JsonDiffType = "added" | "removed" | "changed";

export interface JsonDiffEntry {
  path: string;
  type: JsonDiffType;
  left?: unknown;
  right?: unknown;
}

const isObj = (v: unknown): v is Record<string, unknown> =>
  v !== null && typeof v === "object" && !Array.isArray(v);

const equal = (a: unknown, b: unknown): boolean =>
  JSON.stringify(a) === JSON.stringify(b);

export function diffJson(a: unknown, b: unknown): JsonDiffEntry[] {
  const out: JsonDiffEntry[] = [];
  walk("", a, b, out);
  return out;
}

function walk(path: string, a: unknown, b: unknown, out: JsonDiffEntry[]): void {
  if (equal(a, b)) return;

  if (isObj(a) && isObj(b)) {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const k of [...keys].sort()) {
      const p = path ? `${path}.${k}` : k;
      if (!(k in a)) out.push({ path: p, type: "added", right: b[k] });
      else if (!(k in b)) out.push({ path: p, type: "removed", left: a[k] });
      else walk(p, a[k], b[k], out);
    }
    return;
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    const len = Math.max(a.length, b.length);
    for (let i = 0; i < len; i++) {
      const p = `${path}[${i}]`;
      if (i >= a.length) out.push({ path: p, type: "added", right: b[i] });
      else if (i >= b.length) out.push({ path: p, type: "removed", left: a[i] });
      else walk(p, a[i], b[i], out);
    }
    return;
  }

  out.push({ path: path || "(root)", type: "changed", left: a, right: b });
}

export function preview(value: unknown): string {
  if (value === undefined) return "—";
  const s = JSON.stringify(value);
  return s.length > 80 ? s.slice(0, 79) + "…" : s;
}
