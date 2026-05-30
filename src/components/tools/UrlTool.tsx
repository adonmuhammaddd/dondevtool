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

export default function UrlTool() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<Mode>("encode");

  const result = useMemo(() => {
    if (!input) return { out: "", error: null as string | null };
    try {
      return {
        out: mode === "encode" ? encodeURIComponent(input) : decodeURIComponent(input),
        error: null,
      };
    } catch {
      return { out: "", error: "Malformed URI sequence." };
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
        <TerminalWindow title={<><b>{mode === "encode" ? "text" : "encoded"}</b> — input</>} glow>
          <textarea
            className={`ta ${result.error ? "error" : ""}`}
            spellCheck={false}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === "encode" ? "https://x.com/?q=hello world" : "https%3A%2F%2Fx.com"}
          />
        </TerminalWindow>
        <TerminalWindow
          title={<><b>result</b> — output</>}
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
