/**
 * HMAC signing and AES-GCM encryption using the native Web Crypto API.
 * Everything runs locally in the browser — no keys or data leave the machine.
 */

const enc = new TextEncoder();
const dec = new TextDecoder();

function toHex(buf: ArrayBuffer): string {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function toBase64(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

function fromBase64(b64: string): Uint8Array {
  const bin = atob(b64.trim());
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

export type HmacAlgo = "SHA-256" | "SHA-384" | "SHA-512";

/** Computes an HMAC signature, returned as a lowercase hex string. */
export async function hmac(
  message: string,
  key: string,
  algo: HmacAlgo = "SHA-256",
): Promise<string> {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(key),
    { name: "HMAC", hash: algo },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, enc.encode(message));
  return toHex(sig);
}

const PBKDF2_ITERATIONS = 100_000;

async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const baseKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(passphrase),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: salt as BufferSource, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

/**
 * Encrypts text with AES-GCM-256, deriving the key from a passphrase via
 * PBKDF2. Returns base64 of `salt(16) | iv(12) | ciphertext`.
 */
export async function aesEncrypt(plaintext: string, passphrase: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passphrase, salt);
  const ct = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv as BufferSource },
    key,
    enc.encode(plaintext),
  );
  const ctBytes = new Uint8Array(ct);
  const combined = new Uint8Array(salt.length + iv.length + ctBytes.length);
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(ctBytes, salt.length + iv.length);
  return toBase64(combined);
}

/** Decrypts the base64 output of {@link aesEncrypt} with the same passphrase. */
export async function aesDecrypt(payload: string, passphrase: string): Promise<string> {
  const bytes = fromBase64(payload);
  if (bytes.length < 29) throw new Error("Ciphertext too short.");
  const salt = bytes.slice(0, 16);
  const iv = bytes.slice(16, 28);
  const ct = bytes.slice(28);
  const key = await deriveKey(passphrase, salt);
  const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: iv as BufferSource }, key, ct);
  return dec.decode(pt);
}
