"use client";

import { useMemo, useState } from "react";
import {
  Badge,
  CopyButton,
  EmptyState,
  FieldLabel,
  Icon,
  Mascot,
  OutputBox,
  Segmented,
  Speech,
  TerminalWindow,
} from "@/components/ui";
import { highlightJson } from "@/lib/highlight";

type Indent = "2" | "4" | "tab" | "min";

interface JsonResult {
  empty?: boolean;
  ok?: boolean;
  out?: string;
  keys?: number;
  bytes?: number;
  error?: string;
  line?: number | null;
}

const SAMPLE = `{"app":"DonDevTool","version":"1.0.0","offline":true,"tools":16,"owner":{"name":"Don","role":"developer"},"tags":["json","regex","local"],"meta":null}`;

export default function JsonFormatter() {
  const [src, setSrc] = useState(SAMPLE);
  const [indent, setIndent] = useState<Indent>("2");

  const result = useMemo<JsonResult>(() => {
    const trimmed = src.trim();
    if (!trimmed) return { empty: true };
    try {
      const val: unknown = JSON.parse(trimmed);
      const space = indent === "tab" ? "\t" : indent === "min" ? undefined : Number(indent);
      const out = JSON.stringify(val, null, space);
      const keys = (out.match(/"[^"]*"\s*:/g) || []).length;
      return { ok: true, out, keys, bytes: new Blob([out]).size };
    } catch (e) {
      const msg = (e as Error).message;
      const m = /position (\d+)/.exec(msg);
      const line = m ? trimmed.slice(0, +m[1]).split("\n").length : null;
      return { error: msg.replace(/^JSON.parse:?\s*/i, ""), line };
    }
  }, [src, indent]);

  return (
    <div>
      <div className="ctl-bar">
        <FieldLabel>indent</FieldLabel>
        <Segmented
          value={indent}
          onChange={setIndent}
          options={[
            { value: "2", label: "2 spaces" },
            { value: "4", label: "4 spaces" },
            { value: "tab", label: "tab" },
            { value: "min", label: "minify" },
          ]}
        />
        <span className="spacer" />
        {result.ok && <Badge kind="ok">valid · {result.keys} keys · {result.bytes} B</Badge>}
        {result.error && (
          <Badge kind="err">parse error{result.line ? ` · line ${result.line}` : ""}</Badge>
        )}
        <button className="btn ghost sm" onClick={() => setSrc("")}>
          <Icon name="x" size={12} />clear
        </button>
        <button className="btn ghost sm" onClick={() => setSrc(SAMPLE)}>
          sample
        </button>
      </div>

      <div className="io-grid">
        <TerminalWindow title={<><b>input.json</b> — raw</>} glow right={<span className="badge dim">{src.length} chars</span>}>
          <textarea
            className={`ta ${result.error ? "error" : ""}`}
            spellCheck={false}
            value={src}
            onChange={(e) => setSrc(e.target.value)}
            placeholder='{ "paste": "JSON here" }'
          />
        </TerminalWindow>

        <TerminalWindow
          title={<><b>output.json</b> — formatted</>}
          right={result.ok ? <CopyButton text={result.out ?? ""} label="formatted JSON copied" /> : undefined}
        >
          {result.ok && (
            <OutputBox short>
              <pre dangerouslySetInnerHTML={{ __html: highlightJson(result.out ?? "") }} />
            </OutputBox>
          )}
          {result.empty && (
            <EmptyState title="paste JSON to begin">
              Don&apos;s standing by. Drop an object or array on the left and it&apos;ll
              pretty-print here, instantly &amp; offline.
            </EmptyState>
          )}
          {result.error && (
            <div className="flex gap4" style={{ alignItems: "flex-start", padding: "var(--s2)" }}>
              <Mascot style={{ width: 88, flex: "none" }} />
              <div style={{ flex: 1 }}>
                <Speech who="don@dondevtool ~ error">
                  <b style={{ color: "var(--error)" }}>SyntaxError.</b> I couldn&apos;t parse that.
                  <div style={{ marginTop: 8, color: "var(--text-1)", fontSize: "var(--fs-xs)" }}>
                    <span className="tok-punc">{">"} </span>
                    {result.error}
                  </div>
                </Speech>
                <div className="hint mt4">Check for trailing commas, single quotes, or unquoted keys.</div>
              </div>
            </div>
          )}
        </TerminalWindow>
      </div>
    </div>
  );
}
