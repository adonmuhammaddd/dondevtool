"use client";

import { useMemo, useState } from "react";
import { diffJson, preview, type JsonDiffEntry } from "@/lib/jsondiff";
import { Badge, TerminalWindow } from "@/components/ui";

const SAMPLE_A = `{"name":"Don","role":"dev","tools":16,"tags":["json","regex"],"meta":{"offline":true}}`;
const SAMPLE_B = `{"name":"Don","role":"engineer","tools":21,"tags":["json","regex","diff"],"meta":{"offline":true,"theme":"terminal"}}`;

const COLOR: Record<JsonDiffEntry["type"], string> = {
  added: "var(--success)",
  removed: "var(--error)",
  changed: "var(--warning)",
};
const SIGN: Record<JsonDiffEntry["type"], string> = { added: "+", removed: "−", changed: "~" };

export default function JsonDiffTool() {
  const [left, setLeft] = useState(SAMPLE_A);
  const [right, setRight] = useState(SAMPLE_B);

  const result = useMemo(() => {
    let a: unknown, b: unknown;
    try {
      a = JSON.parse(left);
    } catch {
      return { error: "Left side is not valid JSON." };
    }
    try {
      b = JSON.parse(right);
    } catch {
      return { error: "Right side is not valid JSON." };
    }
    return { ok: true as const, diffs: diffJson(a, b) };
  }, [left, right]);

  const counts = result.ok
    ? result.diffs.reduce(
        (acc, d) => ((acc[d.type] = (acc[d.type] || 0) + 1), acc),
        {} as Record<string, number>,
      )
    : {};

  return (
    <div>
      <div className="io-grid mb">
        <TerminalWindow title={<><b>a.json</b> — original</>} glow>
          <textarea className="ta" style={{ minHeight: 180 }} spellCheck={false} value={left} onChange={(e) => setLeft(e.target.value)} placeholder='{ "a": 1 }' />
        </TerminalWindow>
        <TerminalWindow title={<><b>b.json</b> — changed</>} glow>
          <textarea className="ta" style={{ minHeight: 180 }} spellCheck={false} value={right} onChange={(e) => setRight(e.target.value)} placeholder='{ "a": 2 }' />
        </TerminalWindow>
      </div>

      <TerminalWindow
        title={<><b>diff</b> — structural</>}
        right={
          result.ok ? (
            <div className="flex gap2">
              <Badge kind="ok">+{counts.added || 0}</Badge>
              <Badge kind="err">−{counts.removed || 0}</Badge>
              <Badge kind="warn">~{counts.changed || 0}</Badge>
            </div>
          ) : undefined
        }
      >
        {"error" in result && result.error && <Badge kind="err">{result.error}</Badge>}
        {result.ok && result.diffs.length === 0 && (
          <div className="hint" style={{ padding: "var(--s2)" }}>✓ Identical — no structural differences.</div>
        )}
        {result.ok && result.diffs.length > 0 && (
          <div className="rows" style={{ maxHeight: 320, overflow: "auto" }}>
            {result.diffs.map((d, i) => (
              <div className="row" key={i}>
                <span style={{ width: 14, flex: "none", color: COLOR[d.type], fontWeight: 700 }}>{SIGN[d.type]}</span>
                <span className="rk" style={{ width: "auto", flex: "none", maxWidth: "40%", color: "var(--text-0)" }}>{d.path}</span>
                <span className="rv" style={{ color: "var(--text-1)" }}>
                  {d.type === "changed" ? (
                    <>
                      <span style={{ color: "var(--error)" }}>{preview(d.left)}</span>
                      {" → "}
                      <span style={{ color: "var(--success)" }}>{preview(d.right)}</span>
                    </>
                  ) : d.type === "added" ? (
                    <span style={{ color: "var(--success)" }}>{preview(d.right)}</span>
                  ) : (
                    <span style={{ color: "var(--error)" }}>{preview(d.left)}</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        )}
      </TerminalWindow>
    </div>
  );
}
