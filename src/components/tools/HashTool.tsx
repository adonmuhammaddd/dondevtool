"use client";

import { useEffect, useState } from "react";
import { md5 } from "@/lib/md5";
import { CopyButton, FieldLabel, TerminalWindow } from "@/components/ui";

const SUBTLE_ALGOS = ["SHA-1", "SHA-256", "SHA-512"] as const;

async function subtleHex(algo: string, text: string): Promise<string> {
  const buf = await crypto.subtle.digest(algo, new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export default function HashTool() {
  const [input, setInput] = useState("");
  const [hashes, setHashes] = useState<Record<string, string>>({});

  useEffect(() => {
    let active = true;
    (async () => {
      const out: Record<string, string> = { MD5: md5(input) };
      for (const algo of SUBTLE_ALGOS) out[algo] = await subtleHex(algo, input);
      if (active) setHashes(out);
    })();
    return () => {
      active = false;
    };
  }, [input]);

  return (
    <div>
      <TerminalWindow title={<><b>input</b> — text to hash</>} glow className="mb">
        <FieldLabel>plaintext</FieldLabel>
        <textarea
          className="ta"
          style={{ minHeight: 120 }}
          spellCheck={false}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="hash this…"
        />
      </TerminalWindow>

      <div className="rows">
        {["MD5", ...SUBTLE_ALGOS].map((algo) => (
          <div className="row" key={algo}>
            <span className="rk">{algo}</span>
            <span className="rv" style={{ whiteSpace: "normal", wordBreak: "break-all" }}>
              {hashes[algo] ?? "…"}
            </span>
            <CopyButton text={hashes[algo] ?? ""} label={`${algo} copied`} />
          </div>
        ))}
      </div>
      <div className="hint mt4">MD5 / SHA-1 are not collision-resistant — use for checksums, not security.</div>
    </div>
  );
}
