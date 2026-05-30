"use client";

import { useMemo, useState } from "react";
import {
  Badge,
  CopyButton,
  OutputBox,
  Segmented,
  TerminalWindow,
} from "@/components/ui";

type Mode = "encode" | "decode";

function encode(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

function decode(b64: string): string {
  const bin = atob(b64.trim());
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export default function Base64Tool() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<Mode>("encode");

  const result = useMemo(() => {
    if (!input) return { out: "", error: null as string | null };
    try {
      return { out: mode === "encode" ? encode(input) : decode(input), error: null };
    } catch {
      return { out: "", error: "Invalid Base64 input." };
    }
  }, [input, mode]);

  return (
    <div>
      <div className="ctl-bar">
        <Segmented
          value={mode}
          onChange={setMode}
          options={[
            { value: "encode", label: "Encode" },
            { value: "decode", label: "Decode" },
          ]}
        />
        <span className="spacer" />
        {result.error && <Badge kind="err">{result.error}</Badge>}
      </div>

      <div className="io-grid">
        <TerminalWindow title={<><b>{mode === "encode" ? "text" : "base64"}</b> — input</>} glow>
          <textarea
            className={`ta ${result.error ? "error" : ""}`}
            spellCheck={false}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === "encode" ? "Hello 🌍" : "SGVsbG8g8J+MjQ=="}
          />
        </TerminalWindow>
        <TerminalWindow
          title={<><b>{mode === "encode" ? "base64" : "text"}</b> — output</>}
          right={result.out ? <CopyButton text={result.out} label="copied" /> : undefined}
        >
          <OutputBox short>
            <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-all" }}>{result.out}</pre>
          </OutputBox>
        </TerminalWindow>
      </div>
    </div>
  );
}
