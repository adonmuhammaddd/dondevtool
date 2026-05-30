"use client";

import { useMemo, useState } from "react";
import { diffLines, diffStats } from "@/lib/diff";
import { Badge, TerminalWindow } from "@/components/ui";

export default function DiffTool() {
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");

  const { lines, stats } = useMemo(() => {
    const lines = diffLines(left, right);
    return { lines, stats: diffStats(lines) };
  }, [left, right]);

  return (
    <div>
      <div className="io-grid mb">
        <TerminalWindow title={<><b>original</b> — a</>} glow>
          <textarea
            className="ta"
            style={{ minHeight: 200 }}
            spellCheck={false}
            value={left}
            onChange={(e) => setLeft(e.target.value)}
            placeholder="original text…"
          />
        </TerminalWindow>
        <TerminalWindow title={<><b>changed</b> — b</>} glow>
          <textarea
            className="ta"
            style={{ minHeight: 200 }}
            spellCheck={false}
            value={right}
            onChange={(e) => setRight(e.target.value)}
            placeholder="changed text…"
          />
        </TerminalWindow>
      </div>

      <TerminalWindow
        title={<><b>diff</b> — unified</>}
        right={
          <div className="flex gap2">
            <Badge kind="ok">+{stats.added}</Badge>
            <Badge kind="err">−{stats.removed}</Badge>
          </div>
        }
      >
        <div className="outbox short" style={{ overflow: "auto" }}>
          {left || right ? (
            <div style={{ padding: "var(--s2) 0" }}>
              {lines.map((l, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: "var(--s3)",
                    padding: "1px var(--s3)",
                    fontFamily: "var(--font-mono)",
                    fontSize: "var(--fs-sm)",
                    lineHeight: "var(--lh-code)",
                    background:
                      l.type === "add"
                        ? "color-mix(in oklab, var(--success) 14%, transparent)"
                        : l.type === "del"
                          ? "color-mix(in oklab, var(--error) 14%, transparent)"
                          : "transparent",
                    color:
                      l.type === "add"
                        ? "var(--success)"
                        : l.type === "del"
                          ? "var(--error)"
                          : "var(--text-1)",
                  }}
                >
                  <span style={{ width: 12, flex: "none", userSelect: "none", opacity: 0.7 }}>
                    {l.type === "add" ? "+" : l.type === "del" ? "−" : " "}
                  </span>
                  <span style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{l.text || " "}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="hint" style={{ padding: "var(--s3)" }}>Paste text in both panes to compare.</div>
          )}
        </div>
      </TerminalWindow>
    </div>
  );
}
