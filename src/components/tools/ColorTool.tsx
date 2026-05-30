"use client";

import { useMemo, useState } from "react";
import {
  hslToString,
  parseColor,
  rgbToHex,
  rgbToHsl,
  rgbToString,
} from "@/lib/colors";
import { CopyButton, FieldLabel, TerminalWindow } from "@/components/ui";

export default function ColorTool() {
  const [input, setInput] = useState("#3EF07A");

  const parsed = useMemo(() => parseColor(input), [input]);
  const rgb = parsed ?? { r: 62, g: 240, b: 122, a: 1 };
  const hex = rgbToHex({ ...rgb, a: 1 });
  const hsl = rgbToHsl(rgb);
  const lum = 0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b;

  const rows: [string, string][] = [
    ["HEX", hex],
    ["RGB", rgbToString({ ...rgb, a: 1 })],
    ["HSL", hslToString(hsl)],
    ["R G B", `${rgb.r} ${rgb.g} ${rgb.b}`],
    ["H S L", `${hsl.h}° ${hsl.s}% ${hsl.l}%`],
  ];

  return (
    <div className="io-grid">
      <TerminalWindow title={<><b>color</b> — input</>} glow>
        <FieldLabel>
          value{" "}
          <span className="hint" style={{ textTransform: "none", letterSpacing: 0 }}>
            hex · rgb() · hsl() · name
          </span>
        </FieldLabel>
        <div className="flex gap3 items-center">
          <input
            className="inp mono-lg"
            spellCheck={false}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="#3EF07A"
            style={{ flex: 1 }}
          />
          <input
            className="native-color"
            type="color"
            value={hex.toLowerCase().slice(0, 7)}
            onChange={(e) => setInput(e.target.value.toUpperCase())}
            title="pick a color"
          />
        </div>
        {!parsed && input.trim() && (
          <div className="hint mt3" style={{ color: "var(--error)" }}>
            ⚠ couldn&apos;t read that color — showing last valid.
          </div>
        )}
        <div className="swatch-big mt5" style={{ background: hex }}>
          <span className="hexlabel">{hex}</span>
        </div>
      </TerminalWindow>

      <TerminalWindow title={<><b>conversions</b> — output</>}>
        <div className="rows">
          {rows.map(([k, v]) => (
            <div className="row" key={k}>
              <span className="rk">{k}</span>
              <span className="rv" style={{ fontVariantNumeric: "tabular-nums" }}>{v}</span>
              <CopyButton text={v} label={`${k} copied`} />
            </div>
          ))}
        </div>
        <div className="hint mt4">
          Luminance ≈ {Math.round(lum)} / 255 — {lum > 140 ? "use dark text" : "use light text"} on this color.
        </div>
      </TerminalWindow>
    </div>
  );
}
