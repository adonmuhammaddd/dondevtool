"use client";

import { useEffect, useState } from "react";
import { aesDecrypt, aesEncrypt, hmac, type HmacAlgo } from "@/lib/crypto";
import {
  Badge,
  CopyButton,
  FieldLabel,
  Icon,
  OutputBox,
  Segmented,
  TerminalWindow,
} from "@/components/ui";

type Mode = "hmac" | "aes";

export default function CryptoTool() {
  const [mode, setMode] = useState<Mode>("hmac");
  const [message, setMessage] = useState("");
  const [secret, setSecret] = useState("");
  const [algo, setAlgo] = useState<HmacAlgo>("SHA-256");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // HMAC computes live; AES is button-driven (PBKDF2 is heavy). All state
  // updates happen inside the async closure so none run synchronously in the
  // effect body.
  useEffect(() => {
    if (mode !== "hmac") return;
    let active = true;
    void (async () => {
      if (!message || !secret) {
        if (active) {
          setOutput("");
          setError(null);
        }
        return;
      }
      try {
        const sig = await hmac(message, secret, algo);
        if (active) {
          setOutput(sig);
          setError(null);
        }
      } catch {
        if (active) setError("HMAC failed.");
      }
    })();
    return () => {
      active = false;
    };
  }, [mode, message, secret, algo]);

  const runAes = async (dir: "encrypt" | "decrypt") => {
    setError(null);
    setBusy(true);
    try {
      const out =
        dir === "encrypt"
          ? await aesEncrypt(message, secret)
          : await aesDecrypt(message, secret);
      setOutput(out);
    } catch {
      setError(dir === "decrypt" ? "Decryption failed — wrong passphrase or corrupt input." : "Encryption failed.");
      setOutput("");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="ctl-bar">
        <Segmented
          value={mode}
          onChange={(m) => { setMode(m); setOutput(""); setError(null); }}
          options={[
            { value: "hmac", label: "HMAC" },
            { value: "aes", label: "AES-GCM" },
          ]}
        />
        {mode === "hmac" && (
          <Segmented
            value={algo}
            onChange={setAlgo}
            options={[
              { value: "SHA-256", label: "256" },
              { value: "SHA-384", label: "384" },
              { value: "SHA-512", label: "512" },
            ]}
          />
        )}
        <span className="spacer" />
        {error && <Badge kind="err">{error}</Badge>}
      </div>

      <div className="io-grid">
        <TerminalWindow title={<><b>{mode === "aes" ? "plaintext / ciphertext" : "message"}</b> — input</>} glow>
          <FieldLabel>{mode === "aes" ? "message (plaintext to encrypt, or base64 to decrypt)" : "message"}</FieldLabel>
          <textarea
            className="ta"
            style={{ minHeight: 140 }}
            spellCheck={false}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={mode === "aes" ? "secret text…" : "message to sign…"}
          />
          <div className="mt4">
            <FieldLabel>{mode === "aes" ? "passphrase" : "secret key"}</FieldLabel>
            <input
              className="inp"
              type={mode === "aes" ? "password" : "text"}
              spellCheck={false}
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder={mode === "aes" ? "passphrase…" : "shared secret…"}
            />
          </div>
          {mode === "aes" && (
            <div className="flex gap2 mt4">
              <button className="btn primary sm" disabled={busy || !message || !secret} onClick={() => runAes("encrypt")}>
                <Icon name="bolt" size={12} />encrypt
              </button>
              <button className="btn sm" disabled={busy || !message || !secret} onClick={() => runAes("decrypt")}>
                decrypt
              </button>
              {busy && <span className="spin" style={{ alignSelf: "center" }}>working…</span>}
            </div>
          )}
        </TerminalWindow>

        <TerminalWindow
          title={<><b>{mode === "hmac" ? "signature" : "result"}</b> — output</>}
          right={output ? <CopyButton text={output} label="copied" /> : undefined}
        >
          <OutputBox short>
            <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-all" }}>{output}</pre>
          </OutputBox>
          <div className="hint mt4">
            {mode === "aes"
              ? "AES-GCM-256, key derived from passphrase via PBKDF2 (100k iters). Output = base64(salt|iv|ciphertext)."
              : "HMAC signature in hex. Same message + key + algo always produces the same value."}
          </div>
        </TerminalWindow>
      </div>
    </div>
  );
}
