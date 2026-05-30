/**
 * Standard 5-field cron parser + next-run calculator.
 *
 * Fields: minute(0-59) hour(0-23) day-of-month(1-31) month(1-12) day-of-week(0-6, Sun=0).
 * Supports wildcards, step values (e.g. every-n), ranges (a-b), ranges with
 * steps, comma lists, and 3-letter names for months (jan-dec) and weekdays
 * (sun-sat). Follows Vixie-cron's day-of-month / day-of-week OR rule.
 */

export interface CronFields {
  minutes: Set<number>;
  hours: Set<number>;
  daysOfMonth: Set<number>;
  months: Set<number>;
  daysOfWeek: Set<number>;
  domRestricted: boolean;
  dowRestricted: boolean;
}

const MONTH_NAMES = [
  "jan", "feb", "mar", "apr", "may", "jun",
  "jul", "aug", "sep", "oct", "nov", "dec",
];
const DOW_NAMES = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

export function parseCron(expr: string): CronFields {
  const parts = expr.trim().toLowerCase().split(/\s+/);
  if (parts.length !== 5) {
    throw new Error(
      `Expected 5 fields (min hour day month weekday), got ${parts.length}.`,
    );
  }

  const [min, hour, dom, mon, dow] = parts;
  return {
    minutes: parseField(min, 0, 59),
    hours: parseField(hour, 0, 23),
    daysOfMonth: parseField(dom, 1, 31),
    months: parseField(mon, 1, 12, MONTH_NAMES, 1),
    daysOfWeek: normalizeDow(parseField(dow, 0, 7, DOW_NAMES, 0)),
    domRestricted: dom !== "*",
    dowRestricted: dow !== "*",
  };
}

/** Maps day-of-week 7 -> 0 (both mean Sunday). */
function normalizeDow(set: Set<number>): Set<number> {
  const out = new Set<number>();
  for (const v of set) out.add(v === 7 ? 0 : v);
  return out;
}

function parseField(
  field: string,
  min: number,
  max: number,
  names?: string[],
  nameOffset = 0,
): Set<number> {
  const result = new Set<number>();
  for (const piece of field.split(",")) {
    let step = 1;
    let range = piece;
    const slash = piece.indexOf("/");
    if (slash !== -1) {
      step = parseInt(piece.slice(slash + 1), 10);
      range = piece.slice(0, slash);
      if (!Number.isInteger(step) || step <= 0)
        throw new Error(`Invalid step in "${piece}".`);
    }

    let lo: number;
    let hi: number;
    if (range === "*") {
      lo = min;
      hi = max;
    } else if (range.includes("-")) {
      const [a, b] = range.split("-");
      lo = resolveValue(a, names, nameOffset);
      hi = resolveValue(b, names, nameOffset);
    } else {
      lo = resolveValue(range, names, nameOffset);
      hi = slash !== -1 ? max : lo;
    }

    if (lo < min || hi > max || lo > hi)
      throw new Error(`Value out of range [${min}-${max}] in "${piece}".`);

    for (let v = lo; v <= hi; v += step) result.add(v);
  }
  if (result.size === 0) throw new Error(`Empty field "${field}".`);
  return result;
}

function resolveValue(token: string, names?: string[], offset = 0): number {
  if (names) {
    const idx = names.indexOf(token);
    if (idx !== -1) return idx + offset;
  }
  const n = parseInt(token, 10);
  if (!Number.isInteger(n)) throw new Error(`Invalid value "${token}".`);
  return n;
}

/**
 * Returns the next `count` run times at or after `from` (exclusive of `from`'s
 * current minute). Operates in local time.
 */
export function nextRuns(expr: string, count = 5, from = new Date()): Date[] {
  const f = parseCron(expr);
  const runs: Date[] = [];

  const d = new Date(from);
  d.setSeconds(0, 0);
  d.setMinutes(d.getMinutes() + 1);

  // Cap iterations (~8 years of minutes) to guarantee termination.
  let guard = 0;
  const MAX = 8 * 366 * 24 * 60;
  while (runs.length < count && guard++ < MAX) {
    if (matches(f, d)) runs.push(new Date(d));
    d.setMinutes(d.getMinutes() + 1);
  }
  return runs;
}

function matches(f: CronFields, d: Date): boolean {
  if (!f.minutes.has(d.getMinutes())) return false;
  if (!f.hours.has(d.getHours())) return false;
  if (!f.months.has(d.getMonth() + 1)) return false;

  const domOk = f.daysOfMonth.has(d.getDate());
  const dowOk = f.daysOfWeek.has(d.getDay());

  // Vixie rule: if both DOM and DOW are restricted, match if EITHER matches.
  if (f.domRestricted && f.dowRestricted) return domOk || dowOk;
  if (f.domRestricted) return domOk;
  if (f.dowRestricted) return dowOk;
  return true;
}
