"use client";

import { useMemo, useState } from "react";
import {
  Badge,
  Chip,
  FieldLabel,
  Mascot,
  OutputBox,
  Speech,
  TerminalWindow,
} from "@/components/ui";

const RX_FLAGS: [string, string][] = [
  ["g", "global"], ["i", "ignore-case"], ["m", "multiline"],
  ["s", "dotall"], ["u", "unicode"], ["y", "sticky"],
];

const SAMPLE = `Don shipped 3 builds today: v1.0.2, v1.0.3 and v1.1.0-beta.
Contact: don@dondevtool.dev  ·  backup: hello+don@example.io
Run at 09:30 and 18:45. Ticket #DON-204 closed, #DON-205 open.`;

type Flags = Record<string, boolean>;

interface Match {
  index: number;
  str: string;
  groups: string[];
}
interface Seg {
  t: string;
  hit?: boolean;
  alt?: boolean;
}
interface RegexResult {
  empty?: boolean;
  error?: string;
  ok?: boolean;
  matches?: Match[];
  segs?: Seg[];
}

export default function RegexTool() {
  const [pattern, setPattern] = useState("(\\w+)@([\\w.]+)");
  const [flags, setFlags] = useState<Flags>({ g: true, i: true });
  const [text, setText] = useState(SAMPLE);

  const flagStr = Object.keys(flags).filter((f) => flags[f]).join("");
  const toggle = (f: string) => setFlags((x) => ({ ...x, [f]: !x[f] }));

  const res = useMemo<RegexResult>(() => {
    if (!pattern) return { empty: true };
    let re: RegExp;
    try {
      re = new RegExp(pattern, flagStr.includes("g") ? flagStr : flagStr + "g");
    } catch (e) {
      return { error: (e as Error).message };
    }
    const matches: Match[] = [];
    let m: RegExpExecArray | null;
    let guard = 0;
    while ((m = re.exec(text)) !== null) {
      matches.push({ index: m.index, str: m[0], groups: m.slice(1).map((g) => g ?? "") });
      if (m.index === re.lastIndex) re.lastIndex++;
      if (++guard > 5000) break;
    }
    const segs: Seg[] = [];
    let cur = 0;
    matches.forEach((mt, i) => {
      if (mt.index > cur) segs.push({ t: text.slice(cur, mt.index) });
      segs.push({ t: mt.str, hit: true, alt: i % 2 === 1 });
      cur = mt.index + mt.str.length;
    });
    if (cur < text.length) segs.push({ t: text.slice(cur) });
    return { ok: true, matches, segs };
  }, [pattern, flagStr, text]);

  const matchList = res.matches ?? [];
  const segList = res.segs ?? [];

  return (
    <div>
      <div className="ctl-bar">
        <div style={{ flex: 1, minWidth: 280 }}>
          <FieldLabel>pattern</FieldLabel>
          <div className="flex items-center gap2">
            <span className="muted" style={{ fontSize: "var(--fs-md)" }}>/</span>
            <input
              className={`inp mono-lg ${res.error ? "error" : ""}`}
              spellCheck={false}
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="\\d+"
            />
            <span className="muted" style={{ fontSize: "var(--fs-md)" }}>/{flagStr}</span>
          </div>
        </div>
      </div>

      <div className="ctl-bar">
        <FieldLabel>flags</FieldLabel>
        <div className="chips">
          {RX_FLAGS.map(([f, name]) => (
            <Chip key={f} on={flags[f]} onClick={() => toggle(f)}>
              {f} <span className="muted" style={{ fontSize: 10 }}>{name}</span>
            </Chip>
          ))}
        </div>
        <span className="spacer" />
        {res.ok && <Badge kind={matchList.length ? "ok" : "dim"}>{matchList.length} match{matchList.length === 1 ? "" : "es"}</Badge>}
        {res.error && <Badge kind="err">invalid pattern</Badge>}
      </div>

      <div className="io-grid">
        <TerminalWindow title={<><b>test-string</b> — input</>} glow>
          <textarea
            className="ta"
            style={{ minHeight: 200 }}
            spellCheck={false}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="text to search…"
          />
        </TerminalWindow>

        <TerminalWindow title={<><b>matches</b> — highlighted</>}>
          {res.error && (
            <div className="flex gap4" style={{ alignItems: "flex-start" }}>
              <Mascot style={{ width: 80, flex: "none" }} />
              <Speech who="don@regex ~ error">
                <b style={{ color: "var(--error)" }}>Bad pattern.</b> {res.error}
              </Speech>
            </div>
          )}
          {res.ok && (
            <>
              <OutputBox short style={{ minHeight: 120 }}>
                <div className="rx-out" style={{ padding: "var(--s3)" }}>
                  {segList.map((s, i) =>
                    s.hit ? (
                      <mark key={i} className={`rx-hit ${s.alt ? "alt" : ""}`}>{s.t}</mark>
                    ) : (
                      <span key={i}>{s.t}</span>
                    ),
                  )}
                </div>
              </OutputBox>
              <div className="mt4">
                <FieldLabel>capture groups</FieldLabel>
                {matchList.length === 0 && <div className="hint">No matches — adjust the pattern or flags.</div>}
                {matchList.length > 0 && (
                  <div className="rows" style={{ maxHeight: 200, overflow: "auto" }}>
                    {matchList.slice(0, 30).map((mt, i) => (
                      <div className="row" key={i}>
                        <span className="rk">@{mt.index}</span>
                        <span className="rv accent">{mt.str}</span>
                        {mt.groups.length > 0 && (
                          <span className="rv muted" style={{ flex: "none", maxWidth: "50%" }}>
                            {mt.groups.map((g, j) => (
                              <span key={j}>[{j + 1}] <span className="tok-str">{g}</span>{"  "}</span>
                            ))}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </TerminalWindow>
      </div>
    </div>
  );
}
