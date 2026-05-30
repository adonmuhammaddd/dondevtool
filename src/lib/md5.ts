/**
 * Self-contained MD5 implementation (Web Crypto's subtle.digest does not
 * support MD5). Operates on a UTF-8 string and returns a lowercase hex digest.
 *
 * MD5 is cryptographically broken — exposed here only as a checksum/lookup
 * utility, never for security.
 */

export function md5(input: string): string {
  const bytes = new TextEncoder().encode(input);
  return md5Bytes(bytes);
}

function md5Bytes(msg: Uint8Array): string {
  const n = msg.length;
  // Pad: append 0x80, then zeros, then 64-bit little-endian bit length.
  const withLenBits = n * 8;
  const totalLen = ((n + 8) >>> 6) * 64 + 64;
  const buf = new Uint8Array(totalLen);
  buf.set(msg);
  buf[n] = 0x80;
  // 64-bit length (we only fill the low 32 bits + next; JS bit ops are 32-bit).
  const lenLo = withLenBits >>> 0;
  const lenHi = Math.floor(withLenBits / 0x100000000) >>> 0;
  buf[totalLen - 8] = lenLo & 0xff;
  buf[totalLen - 7] = (lenLo >>> 8) & 0xff;
  buf[totalLen - 6] = (lenLo >>> 16) & 0xff;
  buf[totalLen - 5] = (lenLo >>> 24) & 0xff;
  buf[totalLen - 4] = lenHi & 0xff;
  buf[totalLen - 3] = (lenHi >>> 8) & 0xff;
  buf[totalLen - 2] = (lenHi >>> 16) & 0xff;
  buf[totalLen - 1] = (lenHi >>> 24) & 0xff;

  let a0 = 0x67452301;
  let b0 = 0xefcdab89;
  let c0 = 0x98badcfe;
  let d0 = 0x10325476;

  const M = new Int32Array(16);
  for (let off = 0; off < totalLen; off += 64) {
    for (let i = 0; i < 16; i++) {
      const j = off + i * 4;
      M[i] = buf[j] | (buf[j + 1] << 8) | (buf[j + 2] << 16) | (buf[j + 3] << 24);
    }

    let a = a0;
    let b = b0;
    let c = c0;
    let d = d0;

    for (let i = 0; i < 64; i++) {
      let f: number;
      let g: number;
      if (i < 16) {
        f = (b & c) | (~b & d);
        g = i;
      } else if (i < 32) {
        f = (d & b) | (~d & c);
        g = (5 * i + 1) % 16;
      } else if (i < 48) {
        f = b ^ c ^ d;
        g = (3 * i + 5) % 16;
      } else {
        f = c ^ (b | ~d);
        g = (7 * i) % 16;
      }
      const tmp = d;
      d = c;
      c = b;
      const sum = (a + f + K[i] + M[g]) | 0;
      b = (b + rotl(sum, S[i])) | 0;
      a = tmp;
    }

    a0 = (a0 + a) | 0;
    b0 = (b0 + b) | 0;
    c0 = (c0 + c) | 0;
    d0 = (d0 + d) | 0;
  }

  return toHexLE(a0) + toHexLE(b0) + toHexLE(c0) + toHexLE(d0);
}

function rotl(x: number, c: number): number {
  return (x << c) | (x >>> (32 - c));
}

/** 32-bit word to little-endian hex (MD5 output byte order). */
function toHexLE(x: number): string {
  let out = "";
  for (let i = 0; i < 4; i++) {
    const byte = (x >>> (i * 8)) & 0xff;
    out += byte.toString(16).padStart(2, "0");
  }
  return out;
}

// Per-round shift amounts.
const S = [
  7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 5, 9, 14, 20, 5,
  9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11,
  16, 23, 4, 11, 16, 23, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15,
  21,
];

// Precomputed K[i] = floor(2^32 * abs(sin(i+1))).
const K = [
  0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee, 0xf57c0faf, 0x4787c62a,
  0xa8304613, 0xfd469501, 0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be,
  0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821, 0xf61e2562, 0xc040b340,
  0x265e5a51, 0xe9b6c7aa, 0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8,
  0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed, 0xa9e3e905, 0xfcefa3f8,
  0x676f02d9, 0x8d2a4c8a, 0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c,
  0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70, 0x289b7ec6, 0xeaa127fa,
  0xd4ef3085, 0x04881d05, 0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665,
  0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039, 0x655b59c3, 0x8f0ccc92,
  0xffeff47d, 0x85845dd1, 0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1,
  0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391,
].map((x) => x | 0);
