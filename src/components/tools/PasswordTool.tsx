"use client";

import { useCallback, useEffect, useState } from "react";
import { Chip, CopyButton, FieldLabel, Icon, TerminalWindow } from "@/components/ui";

const SETS = {
  lower: "abcdefghijklmnopqrstuvwxyz",
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  digits: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{};:,.<>?",
};
type SetKey = keyof typeof SETS;

function randomInt(max: number): number {
  const buf = new Uint32Array(1);
  const limit = Math.floor(0xffffffff / max) * max;
  let x = 0;
  do {
    crypto.getRandomValues(buf);
    x = buf[0];
  } while (x >= limit);
  return x % max;
}

export default function PasswordTool() {
  const [length, setLength] = useState(20);
  const [enabled, setEnabled] = useState<Record<SetKey, boolean>>({
    lower: true,
    upper: true,
    digits: true,
    symbols: true,
  });
  const [password, setPassword] = useState("");

  const generate = useCallback(() => {
    const pool = (Object.keys(SETS) as SetKey[])
      .filter((k) => enabled[k])
      .map((k) => SETS[k])
      .join("");
    if (!pool) return setPassword("");
    let out = "";
    for (let i = 0; i < length; i++) out += pool[randomInt(pool.length)];
    setPassword(out);
  }, [length, enabled]);

  // Client-only random init to avoid an SSR/hydration mismatch.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional client-only random init
    generate();
  }, [generate]);

  return (
    <div>
      <TerminalWindow title={<><b>generator</b> — options</>} glow className="mb">
        <FieldLabel right={<span className="accent" style={{ fontSize: "var(--fs-sm)" }}>{length}</span>}>
          length
        </FieldLabel>
        <div className="slider mb">
          <input
            type="range"
            min={4}
            max={64}
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
          />
          <span className="val">{length}</span>
        </div>
        <FieldLabel>character sets</FieldLabel>
        <div className="chips">
          {(Object.keys(SETS) as SetKey[]).map((k) => (
            <Chip key={k} on={enabled[k]} onClick={() => setEnabled((p) => ({ ...p, [k]: !p[k] }))}>
              {k}
            </Chip>
          ))}
        </div>
      </TerminalWindow>

      <TerminalWindow
        title={<><b>password</b> — output</>}
        right={
          <div className="flex gap2">
            <CopyButton text={password} label="password copied" />
            <button className="btn primary sm" onClick={generate}>
              <Icon name="refresh" size={13} />new
            </button>
          </div>
        }
      >
        <div
          className="inp mono-lg"
          style={{ height: "auto", padding: "var(--s4)", wordBreak: "break-all", color: "var(--accent)" }}
        >
          {password || <span className="muted" style={{ fontSize: "var(--fs-sm)" }}>select at least one character set</span>}
        </div>
      </TerminalWindow>
    </div>
  );
}
