"use client";

import { useMemo, useState } from "react";
import { Badge, CopyButton, FieldLabel, Icon, TerminalWindow } from "@/components/ui";

interface Row {
  label: string;
  value: string;
}

function relative(ms: number): string {
  const diff = ms - Date.now();
  const abs = Math.abs(diff);
  const steps: [number, number, Intl.RelativeTimeFormatUnit][] = [
    [60_000, 1000, "second"],
    [3_600_000, 60_000, "minute"],
    [86_400_000, 3_600_000, "hour"],
    [2_592_000_000, 86_400_000, "day"],
    [31_536_000_000, 2_592_000_000, "month"],
    [Infinity, 31_536_000_000, "year"],
  ];
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  for (const [limit, div, unit] of steps) {
    if (abs < limit) return rtf.format(Math.round(diff / div), unit);
  }
  return "";
}

function fromEpoch(input: string): Row[] | { error: string } {
  const n = Number(input.trim());
  if (!Number.isFinite(n)) return { error: "Enter a numeric epoch value." };
  const ms = Math.abs(n) >= 1e12 ? n : n * 1000;
  const d = new Date(ms);
  if (Number.isNaN(d.getTime())) return { error: "Out of range." };
  return [
    { label: "local", value: d.toLocaleString() },
    { label: "utc", value: d.toUTCString() },
    { label: "iso", value: d.toISOString() },
    { label: "epoch s", value: String(Math.floor(ms / 1000)) },
    { label: "epoch ms", value: String(ms) },
    { label: "relative", value: relative(ms) },
  ];
}

export default function TimestampTool() {
  const [input, setInput] = useState("");

  const { rows, error } = useMemo(() => {
    if (!input.trim()) return { rows: [] as Row[], error: null as string | null };
    const r = fromEpoch(input);
    return "error" in r ? { rows: [] as Row[], error: r.error } : { rows: r, error: null };
  }, [input]);

  return (
    <div>
      <TerminalWindow
        title={<><b>timestamp</b> — unix epoch</>}
        glow
        className="mb"
        right={error ? <Badge kind="err">{error}</Badge> : undefined}
      >
        <FieldLabel right={
          <button className="btn ghost sm" onClick={() => setInput(String(Date.now()))}>
            <Icon name="bolt" size={12} />now
          </button>
        }>
          seconds or milliseconds
        </FieldLabel>
        <input
          className={`inp mono-lg ${error ? "error" : ""}`}
          inputMode="numeric"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="1767225600"
        />
      </TerminalWindow>

      {rows.length > 0 && (
        <div className="rows">
          {rows.map((r) => (
            <div className="row" key={r.label}>
              <span className="rk">{r.label}</span>
              <span className="rv">{r.value}</span>
              <CopyButton text={r.value} label={`${r.label} copied`} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
