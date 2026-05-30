"use client";

import { useMemo, useState } from "react";
import {
  Badge,
  CopyButton,
  FieldLabel,
  OutputBox,
  TerminalWindow,
} from "@/components/ui";
import { highlightJson } from "@/lib/highlight";

function b64urlDecode(part: string): string {
  const b64 = part.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(part.length / 4) * 4, "=");
  const bin = atob(b64);
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
}

const pretty = (json: string) => JSON.stringify(JSON.parse(json), null, 2);

function describeTimes(payload: string): string[] {
  try {
    const obj = JSON.parse(payload) as Record<string, unknown>;
    const notes: string[] = [];
    const fmt = (k: string, v: unknown) => {
      if (typeof v === "number") notes.push(`${k}: ${new Date(v * 1000).toLocaleString()}`);
    };
    fmt("iat", obj.iat);
    fmt("exp", obj.exp);
    fmt("nbf", obj.nbf);
    if (typeof obj.exp === "number")
      notes.push(obj.exp * 1000 < Date.now() ? "⚠ token expired" : "✓ not expired");
    return notes;
  } catch {
    return [];
  }
}

const SAMPLE =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkRvbiIsImlhdCI6MTcwMDAwMDAwMH0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

export default function JwtTool() {
  const [token, setToken] = useState(SAMPLE);

  const result = useMemo(() => {
    const t = token.trim();
    if (!t) return { header: "", payload: "", error: null as string | null, notes: [] as string[] };
    const parts = t.split(".");
    if (parts.length < 2)
      return { header: "", payload: "", error: "Not a JWT (expected header.payload.signature).", notes: [] };
    try {
      const header = pretty(b64urlDecode(parts[0]));
      const payloadRaw = b64urlDecode(parts[1]);
      return { header, payload: pretty(payloadRaw), error: null, notes: describeTimes(payloadRaw) };
    } catch {
      return { header: "", payload: "", error: "Failed to decode token.", notes: [] };
    }
  }, [token]);

  return (
    <div>
      <TerminalWindow
        title={<><b>jwt</b> — token</>}
        glow
        className="mb"
        right={result.error ? <Badge kind="err">invalid</Badge> : <Badge kind="ok">decoded</Badge>}
      >
        <FieldLabel>encoded token</FieldLabel>
        <textarea
          className={`ta ${result.error ? "error" : ""}`}
          style={{ minHeight: 90, whiteSpace: "pre-wrap", wordBreak: "break-all" }}
          spellCheck={false}
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="eyJhbGci…"
        />
      </TerminalWindow>

      <div className="io-grid">
        <TerminalWindow
          title={<><b>header</b> — alg</>}
          right={result.header ? <CopyButton text={result.header} label="header copied" /> : undefined}
        >
          <OutputBox short>
            <pre dangerouslySetInnerHTML={{ __html: highlightJson(result.header) }} />
          </OutputBox>
        </TerminalWindow>
        <TerminalWindow
          title={<><b>payload</b> — claims</>}
          right={result.payload ? <CopyButton text={result.payload} label="payload copied" /> : undefined}
        >
          <OutputBox short>
            <pre dangerouslySetInnerHTML={{ __html: highlightJson(result.payload) }} />
          </OutputBox>
        </TerminalWindow>
      </div>

      {result.notes.length > 0 && (
        <div className="rows mt4">
          {result.notes.map((n) => (
            <div className="row" key={n}>
              <span className="rv">{n}</span>
            </div>
          ))}
        </div>
      )}
      <div className="hint mt4">Decodes only — the signature is not verified.</div>
    </div>
  );
}
