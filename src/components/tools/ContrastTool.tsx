"use client";

import { useMemo, useState } from "react";
import { contrastRatio, parseColor, rgbToHex, type Rgb } from "@/lib/colors";
import { Badge, FieldLabel, TerminalWindow } from "@/components/ui";

function Picker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const parsed = parseColor(value);
  const hex = parsed ? rgbToHex({ ...parsed, a: 1 }).slice(0, 7) : "#000000";
  return (
    <div style={{ flex: 1 }}>
      <FieldLabel>{label}</FieldLabel>
      <div className="flex gap2 items-center">
        <input
          className="inp mono-lg"
          spellCheck={false}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ flex: 1 }}
        />
        <input
          className="native-color"
          type="color"
          value={hex}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          title={`pick ${label}`}
        />
      </div>
    </div>
  );
}

function Check({ label, pass, req }: { label: string; pass: boolean; req: string }) {
  return (
    <div className="row">
      <span className="rk">{label}</span>
      <span className="rv muted" style={{ flex: "none", width: 70 }}>≥ {req}</span>
      <span style={{ marginLeft: "auto" }}>
        <Badge kind={pass ? "ok" : "err"}>{pass ? "PASS" : "FAIL"}</Badge>
      </span>
    </div>
  );
}

export default function ContrastTool() {
  const [fg, setFg] = useState("#0B0D0C");
  const [bg, setBg] = useState("#3EF07A");

  const { ratio, fgRgb, bgRgb } = useMemo(() => {
    const f = parseColor(fg) ?? ({ r: 0, g: 0, b: 0, a: 1 } as Rgb);
    const b = parseColor(bg) ?? ({ r: 255, g: 255, b: 255, a: 1 } as Rgb);
    return { ratio: contrastRatio(f, b), fgRgb: f, bgRgb: b };
  }, [fg, bg]);

  const fgCss = rgbToHex({ ...fgRgb, a: 1 });
  const bgCss = rgbToHex({ ...bgRgb, a: 1 });

  return (
    <div>
      <TerminalWindow title={<><b>colors</b> — foreground / background</>} glow className="mb">
        <div className="flex gap4">
          <Picker label="text (fg)" value={fg} onChange={setFg} />
          <Picker label="background (bg)" value={bg} onChange={setBg} />
        </div>
      </TerminalWindow>

      <div className="io-grid">
        <TerminalWindow title={<><b>preview</b></>}>
          <div
            style={{
              background: bgCss,
              color: fgCss,
              borderRadius: "var(--r-md)",
              padding: "var(--s6)",
              border: "1px solid var(--border)",
              display: "flex",
              flexDirection: "column",
              gap: "var(--s2)",
            }}
          >
            <span style={{ fontSize: "var(--fs-lg)", fontWeight: 700 }}>Large text — 19px bold</span>
            <span style={{ fontSize: "var(--fs-sm)" }}>
              Normal body text. The quick brown fox jumps over the lazy dog.
            </span>
          </div>
          <div className="flex items-center gap3 mt4" style={{ justifyContent: "center" }}>
            <span className="muted" style={{ fontSize: "var(--fs-sm)" }}>contrast ratio</span>
            <span className="accent" style={{ fontSize: "var(--fs-2xl)", fontWeight: 800 }}>
              {ratio.toFixed(2)}
              <span style={{ fontSize: "var(--fs-md)" }}> : 1</span>
            </span>
          </div>
        </TerminalWindow>

        <TerminalWindow title={<><b>wcag</b> — compliance</>}>
          <div className="rows">
            <Check label="AA · normal" req="4.5" pass={ratio >= 4.5} />
            <Check label="AA · large" req="3.0" pass={ratio >= 3} />
            <Check label="AAA · normal" req="7.0" pass={ratio >= 7} />
            <Check label="AAA · large" req="4.5" pass={ratio >= 4.5} />
            <Check label="UI components" req="3.0" pass={ratio >= 3} />
          </div>
          <div className="hint mt4">
            Large = 18.66px bold or 24px+. UI = icons, borders, form controls.
          </div>
        </TerminalWindow>
      </div>
    </div>
  );
}
