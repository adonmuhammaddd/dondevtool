"use client";

import { useCallback, useEffect, useState } from "react";
import { CopyButton, Icon, OutputBox, Segmented, TerminalWindow } from "@/components/ui";

export default function UuidTool() {
  const [count, setCount] = useState<"1" | "5" | "10" | "25">("5");
  const [uuids, setUuids] = useState<string[]>([]);

  const generate = useCallback(() => {
    setUuids(Array.from({ length: Number(count) }, () => crypto.randomUUID()));
  }, [count]);

  // Client-only: crypto.randomUUID would mismatch between SSR and hydration.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional client-only random init
    generate();
  }, [generate]);

  const joined = uuids.join("\n");

  return (
    <div>
      <div className="ctl-bar">
        <Segmented
          value={count}
          onChange={setCount}
          options={[
            { value: "1", label: "1" },
            { value: "5", label: "5" },
            { value: "10", label: "10" },
            { value: "25", label: "25" },
          ]}
        />
        <button className="btn primary sm" onClick={generate}>
          <Icon name="refresh" size={13} />regenerate
        </button>
        <span className="spacer" />
        <CopyButton text={joined} label="all UUIDs copied" />
      </div>

      <TerminalWindow title={<><b>uuid</b> — v4</>}>
        <OutputBox short>
          <pre>{joined}</pre>
        </OutputBox>
      </TerminalWindow>
    </div>
  );
}
