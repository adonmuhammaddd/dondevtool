"use client";

import { useCallback, useEffect, useState } from "react";
import { CopyButton, Icon, OutputBox, Segmented, TerminalWindow } from "@/components/ui";

const WORDS =
  "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum fugiat nulla pariatur".split(
    " ",
  );

type Unit = "paragraphs" | "sentences" | "words";

const pick = () => WORDS[Math.floor(Math.random() * WORDS.length)];

function sentence(): string {
  const words = Array.from({ length: 8 + Math.floor(Math.random() * 8) }, pick);
  words[0] = words[0][0].toUpperCase() + words[0].slice(1);
  return words.join(" ") + ".";
}

function generate(unit: Unit, count: number): string {
  if (unit === "words") return Array.from({ length: count }, pick).join(" ");
  if (unit === "sentences") return Array.from({ length: count }, sentence).join(" ");
  return Array.from({ length: count }, () =>
    Array.from({ length: 3 + Math.floor(Math.random() * 4) }, sentence).join(" "),
  ).join("\n\n");
}

export default function LoremTool() {
  const [unit, setUnit] = useState<Unit>("paragraphs");
  const [count, setCount] = useState(3);
  const [text, setText] = useState("");

  const run = useCallback(() => setText(generate(unit, count)), [unit, count]);
  // Client-only random init to avoid an SSR/hydration mismatch.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional client-only random init
    run();
  }, [run]);

  return (
    <div>
      <div className="ctl-bar">
        <Segmented
          value={unit}
          onChange={setUnit}
          options={[
            { value: "paragraphs", label: "paragraphs" },
            { value: "sentences", label: "sentences" },
            { value: "words", label: "words" },
          ]}
        />
        <input
          className="inp"
          type="number"
          min={1}
          max={50}
          value={count}
          onChange={(e) => setCount(Math.max(1, Math.min(50, Number(e.target.value) || 1)))}
          style={{ width: 80 }}
        />
        <button className="btn primary sm" onClick={run}>
          <Icon name="refresh" size={13} />regenerate
        </button>
        <span className="spacer" />
        <CopyButton text={text} label="lorem copied" />
      </div>

      <TerminalWindow title={<><b>lorem.txt</b> — output</>}>
        <OutputBox short>
          <pre style={{ whiteSpace: "pre-wrap", fontFamily: "var(--font-read)" }}>{text}</pre>
        </OutputBox>
      </TerminalWindow>
    </div>
  );
}
