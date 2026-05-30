"use client";

import { useMemo, useState } from "react";
import { applyTextOp, TEXT_OPS, textStats, type TextOp } from "@/lib/text";
import { Chip, CopyButton, Icon, OutputBox, TerminalWindow } from "@/components/ui";

export default function TextTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [lastOp, setLastOp] = useState<TextOp | null>(null);

  const run = (op: TextOp) => {
    setOutput(applyTextOp(input, op));
    setLastOp(op);
  };

  const stats = useMemo(() => textStats(input), [input]);
  const useOutputAsInput = () => {
    setInput(output);
    setOutput("");
    setLastOp(null);
  };

  return (
    <div>
      <div className="ctl-bar">
        <div className="chips">
          {TEXT_OPS.map(({ op, label }) => (
            <Chip key={op} on={lastOp === op} onClick={() => run(op)}>
              {label}
            </Chip>
          ))}
        </div>
        <span className="spacer" />
        <button className="btn ghost sm" onClick={() => { setInput(""); setOutput(""); setLastOp(null); }}>
          <Icon name="x" size={12} />clear
        </button>
      </div>

      <div className="ctl-bar">
        {(["lines", "words", "chars", "charsNoSpaces", "bytes"] as const).map((k) => (
          <span key={k} className="badge dim">
            {k === "charsNoSpaces" ? "chars (no ws)" : k}: <b className="accent" style={{ marginLeft: 4 }}>{stats[k]}</b>
          </span>
        ))}
      </div>

      <div className="io-grid">
        <TerminalWindow title={<><b>input</b> — text</>} glow>
          <textarea
            className="ta"
            spellCheck={false}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="paste lines of text…"
          />
        </TerminalWindow>
        <TerminalWindow
          title={<><b>output</b>{lastOp ? ` — ${lastOp}` : ""}</>}
          right={
            output ? (
              <div className="flex gap2">
                <button className="btn ghost sm" onClick={useOutputAsInput}>↑ use as input</button>
                <CopyButton text={output} label="copied" />
              </div>
            ) : undefined
          }
        >
          <OutputBox short>
            <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{output}</pre>
          </OutputBox>
        </TerminalWindow>
      </div>
    </div>
  );
}
