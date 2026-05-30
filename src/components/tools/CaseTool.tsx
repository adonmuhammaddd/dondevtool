"use client";

import { useMemo, useState } from "react";
import { CASE_LABELS, cases, type CaseName } from "@/lib/cases";
import { CopyButton, FieldLabel, TerminalWindow } from "@/components/ui";

const ORDER: CaseName[] = [
  "camel", "pascal", "snake", "constant", "kebab", "title", "sentence", "lower", "upper",
];

export default function CaseTool() {
  const [input, setInput] = useState("Hello world example");

  const results = useMemo(
    () => ORDER.map((name) => ({ name, value: input ? cases[name](input) : "" })),
    [input],
  );

  return (
    <div>
      <TerminalWindow title={<><b>input</b> — any case</>} glow className="mb">
        <FieldLabel>source text</FieldLabel>
        <input
          className="inp"
          spellCheck={false}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="hello world example"
        />
      </TerminalWindow>

      <div className="rows">
        {results.map(({ name, value }) => (
          <div className="row" key={name}>
            <span className="rk">{CASE_LABELS[name]}</span>
            <span className="rv accent">{value || "—"}</span>
            <CopyButton text={value} label={`${CASE_LABELS[name]} copied`} />
          </div>
        ))}
      </div>
    </div>
  );
}
