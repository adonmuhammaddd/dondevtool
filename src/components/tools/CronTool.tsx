"use client";

import { useMemo, useState } from "react";
import { nextRuns } from "@/lib/cron";
import { Badge, Chip, FieldLabel, TerminalWindow } from "@/components/ui";

const PRESETS: { expr: string; label: string }[] = [
  { expr: "* * * * *", label: "every minute" },
  { expr: "*/5 * * * *", label: "every 5 min" },
  { expr: "0 * * * *", label: "hourly" },
  { expr: "0 9 * * 1-5", label: "weekdays 9am" },
  { expr: "0 0 1 * *", label: "monthly" },
];

export default function CronTool() {
  const [expr, setExpr] = useState("*/15 * * * *");

  const { runs, error } = useMemo(() => {
    if (!expr.trim()) return { runs: [], error: null as string | null };
    try {
      return { runs: nextRuns(expr, 7), error: null };
    } catch (e) {
      return { runs: [], error: (e as Error).message };
    }
  }, [expr]);

  return (
    <div>
      <TerminalWindow
        title={<><b>cron</b> — expression</>}
        glow
        className="mb"
        right={error ? <Badge kind="err">invalid</Badge> : <Badge kind="ok">valid</Badge>}
      >
        <FieldLabel>min hour day month weekday</FieldLabel>
        <input
          className={`inp mono-lg ${error ? "error" : ""}`}
          spellCheck={false}
          value={expr}
          onChange={(e) => setExpr(e.target.value)}
          placeholder="*/15 * * * *"
        />
        <div className="chips mt4">
          {PRESETS.map((p) => (
            <Chip key={p.expr} preset onClick={() => setExpr(p.expr)}>
              {p.label}
            </Chip>
          ))}
        </div>
      </TerminalWindow>

      {error ? (
        <div className="flex" style={{ padding: "var(--s2)" }}>
          <Badge kind="err">{error}</Badge>
        </div>
      ) : (
        <TerminalWindow title={<><b>next runs</b> — local time</>}>
          <div className="rows">
            {runs.map((d, i) => (
              <div className="row" key={i}>
                <span className="rk">{i + 1} · {d.toLocaleString(undefined, { weekday: "short" })}</span>
                <span className="rv accent">{d.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </TerminalWindow>
      )}
    </div>
  );
}
