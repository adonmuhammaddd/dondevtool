"use client";

import { useMemo, useState } from "react";
import { Badge, CopyButton, FieldLabel, Segmented, TerminalWindow } from "@/components/ui";

type Base = "2" | "8" | "10" | "16";

const BASES: { base: Base; label: string; radix: number; re: RegExp }[] = [
  { base: "2", label: "binary", radix: 2, re: /^[01]+$/ },
  { base: "8", label: "octal", radix: 8, re: /^[0-7]+$/ },
  { base: "10", label: "decimal", radix: 10, re: /^\d+$/ },
  { base: "16", label: "hex", radix: 16, re: /^[0-9a-fA-F]+$/ },
];

export default function NumberBaseTool() {
  const [input, setInput] = useState("255");
  const [from, setFrom] = useState<Base>("10");

  const { rows, error } = useMemo(() => {
    const raw = input.trim().replace(/^0[xbo]/i, "");
    if (!raw) return { rows: [], error: null as string | null };
    const meta = BASES.find((b) => b.base === from)!;
    if (!meta.re.test(raw)) return { rows: [], error: `not a valid ${meta.label} number` };
    const n = [...raw].reduce(
      (acc, ch) => acc * BigInt(meta.radix) + BigInt(parseInt(ch, meta.radix)),
      0n,
    );
    return {
      rows: BASES.map((b) => ({ label: b.label, value: n.toString(b.radix).toUpperCase() })),
      error: null,
    };
  }, [input, from]);

  return (
    <div>
      <TerminalWindow
        title={<><b>number</b> — base convert</>}
        glow
        className="mb"
        right={error ? <Badge kind="err">{error}</Badge> : undefined}
      >
        <FieldLabel>input base</FieldLabel>
        <div className="mb">
          <Segmented
            value={from}
            onChange={setFrom}
            options={BASES.map((b) => ({ value: b.base, label: b.label }))}
          />
        </div>
        <FieldLabel>value</FieldLabel>
        <input
          className={`inp mono-lg ${error ? "error" : ""}`}
          spellCheck={false}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="255"
        />
      </TerminalWindow>

      {rows.length > 0 && (
        <div className="rows">
          {rows.map((r) => (
            <div className="row" key={r.label}>
              <span className="rk">{r.label}</span>
              <span className="rv accent">{r.value}</span>
              <CopyButton text={r.value} label={`${r.label} copied`} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
