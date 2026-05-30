"use client";

import { useMemo, useState } from "react";
import {
  Badge,
  CopyButton,
  OutputBox,
  Segmented,
  TerminalWindow,
} from "@/components/ui";
import { jsonToYaml, yamlToValue, type JsonValue } from "@/lib/yaml";
import { highlightJson } from "@/lib/highlight";

type Dir = "j2y" | "y2j";

interface YamlResult {
  empty?: boolean;
  ok?: boolean;
  out?: string;
  json?: boolean;
  error?: string;
}

export default function JsonYaml() {
  const [input, setInput] = useState("");
  const [dir, setDir] = useState<Dir>("j2y");

  const result = useMemo<YamlResult>(() => {
    if (!input.trim()) return { empty: true };
    try {
      if (dir === "j2y") {
        const parsed = JSON.parse(input) as JsonValue;
        return { ok: true, out: jsonToYaml(parsed), json: false };
      }
      const value = yamlToValue(input);
      return { ok: true, out: JSON.stringify(value, null, 2), json: true };
    } catch (e) {
      return { error: (e as Error).message };
    }
  }, [input, dir]);

  return (
    <div>
      <div className="ctl-bar">
        <Segmented
          value={dir}
          onChange={setDir}
          options={[
            { value: "j2y", label: "JSON → YAML" },
            { value: "y2j", label: "YAML → JSON" },
          ]}
        />
        <span className="spacer" />
        {result.error && <Badge kind="err">parse error</Badge>}
        {result.ok && <Badge kind="ok">converted</Badge>}
      </div>

      <div className="io-grid">
        <TerminalWindow title={<><b>{dir === "j2y" ? "input.json" : "input.yaml"}</b> — source</>} glow>
          <textarea
            className={`ta ${result.error ? "error" : ""}`}
            spellCheck={false}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={dir === "j2y" ? '{ "a": 1 }' : "a: 1"}
          />
        </TerminalWindow>

        <TerminalWindow
          title={<><b>{dir === "j2y" ? "output.yaml" : "output.json"}</b> — result</>}
          right={result.ok ? <CopyButton text={result.out ?? ""} label="copied" /> : undefined}
        >
          {result.ok && (
            <OutputBox short>
              {result.json ? (
                <pre dangerouslySetInnerHTML={{ __html: highlightJson(result.out ?? "") }} />
              ) : (
                <pre>{result.out}</pre>
              )}
            </OutputBox>
          )}
          {result.empty && (
            <div className="hint" style={{ padding: "var(--s3)" }}>
              Paste {dir === "j2y" ? "JSON" : "YAML"} on the left to convert. Block-style
              YAML only (no anchors / tags / flow collections).
            </div>
          )}
          {result.error && (
            <div style={{ padding: "var(--s2)" }}>
              <Badge kind="err">{result.error}</Badge>
            </div>
          )}
        </TerminalWindow>
      </div>
    </div>
  );
}
