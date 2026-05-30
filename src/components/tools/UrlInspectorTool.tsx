"use client";

import { useMemo, useState } from "react";
import {
  Badge,
  CopyButton,
  FieldLabel,
  OutputBox,
  TerminalWindow,
} from "@/components/ui";

const PARTS = ["protocol", "username", "password", "hostname", "port", "pathname", "search", "hash", "origin"] as const;

export default function UrlInspectorTool() {
  const [input, setInput] = useState("https://user:pass@api.example.com:8443/v1/items?page=2&sort=name&tag=a&tag=b#section");

  const result = useMemo(() => {
    if (!input.trim()) return { empty: true as const };
    let url: URL;
    try {
      url = new URL(input.trim());
    } catch {
      return { error: "Invalid URL (must include a scheme, e.g. https://)." };
    }
    const parts = PARTS.map((p) => ({ key: p, value: String(url[p] ?? "") })).filter((r) => r.value);
    const params: [string, string][] = [...url.searchParams.entries()];
    const asJson: Record<string, string | string[]> = {};
    for (const [k, v] of params) {
      if (k in asJson) {
        const cur = asJson[k];
        asJson[k] = Array.isArray(cur) ? [...cur, v] : [cur as string, v];
      } else asJson[k] = v;
    }
    return { ok: true as const, parts, params, json: JSON.stringify(asJson, null, 2) };
  }, [input]);

  return (
    <div>
      <TerminalWindow
        title={<><b>url</b> — input</>}
        glow
        className="mb"
        right={"error" in result && result.error ? <Badge kind="err">invalid</Badge> : result.ok ? <Badge kind="ok">parsed</Badge> : undefined}
      >
        <input
          className={`inp mono-lg ${"error" in result && result.error ? "error" : ""}`}
          spellCheck={false}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="https://example.com/path?a=1&b=2#hash"
        />
      </TerminalWindow>

      {result.ok && (
        <div className="io-grid">
          <TerminalWindow title={<><b>components</b></>}>
            <div className="rows">
              {result.parts.map((r) => (
                <div className="row" key={r.key}>
                  <span className="rk">{r.key}</span>
                  <span className="rv accent">{r.value}</span>
                  <CopyButton text={r.value} label={`${r.key} copied`} />
                </div>
              ))}
            </div>
          </TerminalWindow>

          <TerminalWindow
            title={<><b>query params</b> — {result.params.length}</>}
            right={result.params.length ? <CopyButton text={result.json} label="JSON copied" /> : undefined}
          >
            {result.params.length === 0 ? (
              <div className="hint" style={{ padding: "var(--s3)" }}>No query parameters.</div>
            ) : (
              <>
                <div className="rows mb">
                  {result.params.map(([k, v], i) => (
                    <div className="row" key={i}>
                      <span className="rk" style={{ width: 110 }}>{k}</span>
                      <span className="rv">{v}</span>
                    </div>
                  ))}
                </div>
                <FieldLabel>as JSON</FieldLabel>
                <OutputBox short>
                  <pre>{result.json}</pre>
                </OutputBox>
              </>
            )}
          </TerminalWindow>
        </div>
      )}
    </div>
  );
}
